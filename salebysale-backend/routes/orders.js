import { Router } from "express";
import Inventory from "../models/Inventory.js";
import Sku from "../models/Sku.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Reservation from "../models/Reservation.js";
import Dispute from "../models/Dispute.js";
import User from "../models/User.js";
import Shipment from "../models/Shipment.js";
import { auth, allow } from "../middleware/auth.js";
import { haversineKm, quoteLandedPrice, etaMinutesForKm, matchScore } from "../utils/pricing.js";
import { atomicReserve, releaseReservation } from "../services/inventoryService.js";
import { emitEvent, audit } from "../utils/audit.js";

const router = Router();
const RESERVE_MINUTES = Number(process.env.RESERVE_MINUTES || 5);
const ACCEPT_MINUTES = Number(process.env.SUPPLIER_ACCEPT_MINUTES || 5);

const PUBLIC_LISTING = "SELL BY SELL verified stock";

function buyerPricing(p) {
  if (!p) return p;
  return {
    landedPrice: p.landedPrice,
    deliveryCharge: p.deliveryCharge,
    tax: p.tax,
  };
}

function sanitizeOrder(order) {
  const o = order.toObject ? order.toObject() : { ...order };
  delete o.supplierId;
  o.totals = buyerPricing(o.totals);
  o.items = (o.items || []).map((item) => ({
    ...item,
    listingLabel: PUBLIC_LISTING,
    inventoryId: undefined,
    pricing: buyerPricing(item.pricing),
  }));
  if (o.sla) {
    const { km, ...eta } = o.sla;
    o.sla = eta;
  }
  return o;
}

async function buildOffer(inventoryId, buyer) {
  const inv = await Inventory.findById(inventoryId).populate("supplierId");
  if (!inv) throw new Error("Listing not found");
  const sku = await Sku.findById(inv.skuId);
  const km = haversineKm(buyer.location, inv.supplierId.location);
  const pricing = quoteLandedPrice({ floorPrice: inv.minimumPrice, km });
  const eta = etaMinutesForKm(km, inv.readyInMinutes);
  const ridersOn = await User.countDocuments({ role: "rider", dutyOn: true });
  return {
    inv,
    sku,
    km,
    pricing,
    eta,
    score: matchScore({
      price: pricing.landedPrice,
      km,
      readyInMinutes: inv.readyInMinutes,
      reliability: inv.supplierId.reliability,
      riderAvailable: ridersOn > 0,
    }),
  };
}

router.post("/quote", auth, allow("buyer"), async (req, res) => {
  const { inventoryId, qty = 1 } = req.body;
  const offer = await buildOffer(inventoryId, req.user);
  res.json({
    success: true,
    quote: {
      listingLabel: PUBLIC_LISTING,
      sku: offer.sku,
      qty,
      pricing: offer.pricing,
      eta: offer.eta,
      returnPolicy: "DOA / wrong IMEI within 48 hours with sealed-box proof.",
      expiresInMinutes: RESERVE_MINUTES,
    },
  });
});

router.post("/", auth, allow("buyer"), async (req, res) => {
  const { inventoryId, qty = 1 } = req.body;
  const offer = await buildOffer(inventoryId, req.user);
  const { reservation } = await atomicReserve({
    inventoryId,
    qty,
    minutes: RESERVE_MINUTES,
  });
  const order = await Order.create({
    buyerId: req.user._id,
    buyerBusinessId: req.user.businessId,
    supplierId: offer.inv.supplierId._id,
    status: "reserved",
    items: [
      {
        skuId: offer.sku._id,
        inventoryId: offer.inv._id,
        qty,
        listingLabel: PUBLIC_LISTING,
        pricing: offer.pricing,
        eta: offer.eta,
      },
    ],
    totals: offer.pricing,
    sla: { ...offer.eta, km: offer.km },
    acceptDeadline: new Date(Date.now() + ACCEPT_MINUTES * 60 * 1000),
    events: [
      { name: "ordercreated", at: new Date() },
      { name: "stockreserved", at: new Date() },
    ],
  });
  reservation.orderId = order._id;
  await reservation.save();
  emitEvent("ordercreated", { orderId: order._id });
  res.status(201).json({ success: true, order: sanitizeOrder(order) });
});

router.post("/:id/reserve", auth, allow("buyer"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order: sanitizeOrder(order), message: "Already reserved at create time" });
});

router.post("/:id/confirm", auth, allow("buyer"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  const reservation = await Reservation.findOne({ orderId: order._id, state: "active" });
  if (!reservation) return res.status(400).json({ success: false, message: "Reservation expired" });

  const gatewayRef = `PAY_${Date.now()}`;
  await Payment.create({
    orderId: order._id,
    amount: order.totals.landedPrice,
    gatewayRef,
    status: "authorized",
    fee: order.totals.platformFee,
    payout: order.totals.supplierPayout,
  });
  order.status = "awaiting_admin";
  order.payment = { status: "authorized", method: "prepaid_demo", gatewayRef, paidAt: new Date() };
  order.events.push({ name: "paymentauthorized", at: new Date() });
  order.events.push({ name: "adminrequest", at: new Date(), note: "Retailer buy request queued for admin" });
  await order.save();
  emitEvent("paymentauthorized", { orderId: order._id, gatewayRef });
  await audit({
    actorId: req.user._id,
    role: "buyer",
    action: "order.confirm",
    entity: "order",
    entityId: order._id,
  });
  res.json({ success: true, order: sanitizeOrder(order) });
});

router.post("/:id/cancel", auth, async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, buyerId: req.user._id };
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (["delivered", "settled", "cancelled"].includes(order.status)) {
    return res.status(400).json({ success: false, message: "Cannot cancel" });
  }
  const reservation = await Reservation.findOne({ orderId: order._id, state: "active" });
  if (reservation) await releaseReservation(reservation);
  order.status = "cancelled";
  order.events.push({ name: "cancelled", at: new Date(), note: req.body.reason });
  await order.save();
  emitEvent("cancelled", { orderId: order._id });
  res.json({ success: true, order: sanitizeOrder(order) });
});

async function withTracking(order) {
  const shipment = await Shipment.findOne({ orderId: order._id });
  const safe = sanitizeOrder(order);
  safe.tracking = shipment
    ? {
        status: shipment.status,
        eta: order.sla,
        dropLabel: shipment.drop?.shopName,
        deliveryOtp: shipment.demoDeliveryOtp,
        pickedAt: shipment.timestamps?.pickedAt,
        deliveredAt: shipment.timestamps?.deliveredAt,
      }
    : null;
  return safe;
}

router.get("/", auth, allow("buyer"), async (req, res) => {
  const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 }).populate("items.skuId");
  const withShip = await Promise.all(orders.map(withTracking));
  res.json({ success: true, orders: withShip });
});

router.get("/:id", auth, allow("buyer"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id }).populate("items.skuId");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order: await withTracking(order) });
});

router.post("/:id/dispute", auth, allow("buyer"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  const dispute = await Dispute.create({
    orderId: order._id,
    raisedBy: req.user._id,
    reason: req.body.reason,
  });
  order.status = "disputed";
  await order.save();
  res.json({ success: true, dispute });
});

export default router;
