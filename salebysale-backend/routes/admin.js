import { Router } from "express";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Sku from "../models/Sku.js";
import Settlement from "../models/Settlement.js";
import Dispute from "../models/Dispute.js";
import DeviceUnit from "../models/DeviceUnit.js";
import AuditLog from "../models/AuditLog.js";
import Shipment from "../models/Shipment.js";
import { auth, allow } from "../middleware/auth.js";
import { decryptSecret, maskImei } from "../utils/crypto.js";

const router = Router();
router.use(auth, allow("admin"));

router.get("/orders", async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("items.skuId buyerId supplierId buyerBusinessId");
  res.json({ success: true, orders });
});

router.get("/requests", async (_req, res) => {
  const orders = await Order.find({ status: { $in: ["awaiting_admin", "reserved"] } })
    .sort({ createdAt: -1 })
    .populate({ path: "supplierId", populate: { path: "ownerId" } })
    .populate("items.skuId buyerId buyerBusinessId");
  res.json({
    success: true,
    requests: orders.map((order) => ({
      id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      mobile: order.items?.[0]?.skuId,
      qty: order.items?.[0]?.qty,
      totals: order.totals,
      sla: order.sla,
      retailer: {
        name: order.buyerId?.name,
        shopName: order.buyerBusinessId?.shopName,
        phone: order.buyerId?.phone,
        area: order.buyerId?.location?.label,
        address: order.buyerBusinessId?.address,
      },
      wholesaler: {
        shopName: order.supplierId?.shopName,
        listingCode: order.supplierId?.listingCode,
        gst: order.supplierId?.gst,
        area: order.supplierId?.area,
        address: order.supplierId?.address,
        phone: order.supplierId?.ownerId?.phone,
      },
    })),
  });
});

router.post("/orders/:id/arrange", async (req, res) => {
  const { riderId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (!["awaiting_admin", "reserved", "accepted", "packing"].includes(order.status)) {
    return res.status(400).json({ success: false, message: "Order is not waiting for arrangement" });
  }
  const rider = await User.findOne({ _id: riderId, role: "rider" });
  if (!rider) return res.status(404).json({ success: false, message: "Courier not found" });
  const supplier = await Business.findById(order.supplierId).populate("ownerId");
  const buyer = await User.findById(order.buyerId);
  const { generateOtp, hashOtp } = await import("../utils/crypto.js");
  const pickupOtp = generateOtp();
  const deliveryOtp = generateOtp();
  let shipment = await Shipment.findOne({ orderId: order._id });
  const payload = {
    orderId: order._id,
    riderId: rider._id,
    pickup: {
      lat: supplier.location?.lat,
      lng: supplier.location?.lng,
      address: supplier.address,
      shopName: supplier.shopName,
    },
    drop: {
      lat: buyer.location?.lat,
      lng: buyer.location?.lng,
      address: buyer.location?.label,
      shopName: "Retailer dukaan",
    },
    pickupOtpHash: hashOtp(pickupOtp),
    deliveryOtpHash: hashOtp(deliveryOtp),
    demoPickupOtp: pickupOtp,
    demoDeliveryOtp: deliveryOtp,
    timestamps: { assignedAt: new Date() },
    status: "assigned",
  };
  if (shipment) Object.assign(shipment, payload);
  else shipment = new Shipment(payload);
  await shipment.save();
  order.status = "assigned";
  order.events.push({ name: "adminarranged", at: new Date(), note: `Courier ${rider.name}` });
  order.events.push({ name: "riderassigned", at: new Date() });
  await order.save();
  res.json({
    success: true,
    order,
    shipment,
    wholesaler: { shopName: supplier.shopName, address: supplier.address, area: supplier.area },
  });
});

router.get("/inventory", async (_req, res) => {
  const inventory = await Inventory.find().populate("skuId supplierId");
  res.json({ success: true, inventory });
});

router.get("/suppliers", async (_req, res) => {
  const suppliers = await Business.find({ role: "supplier" }).populate("ownerId");
  res.json({ success: true, suppliers });
});

router.get("/buyers", async (_req, res) => {
  const buyers = await Business.find({ role: "buyer" }).populate("ownerId");
  res.json({ success: true, buyers });
});

router.get("/riders", async (_req, res) => {
  const riders = await User.find({ role: "rider" });
  res.json({ success: true, riders });
});

router.get("/catalog", async (_req, res) => {
  const skus = await Sku.find().sort({ brand: 1, model: 1 });
  res.json({ success: true, skus });
});

router.post("/catalog", async (req, res) => {
  const sku = await Sku.create({
    ...req.body,
    searchText: `${req.body.brand} ${req.body.model} ${req.body.variant} ${req.body.color}`,
  });
  res.status(201).json({ success: true, sku });
});

router.get("/settlements", async (_req, res) => {
  const settlements = await Settlement.find().sort({ createdAt: -1 }).populate("supplierId orderId");
  res.json({ success: true, settlements });
});

router.get("/disputes", async (_req, res) => {
  const disputes = await Dispute.find().sort({ createdAt: -1 }).populate("orderId raisedBy");
  res.json({ success: true, disputes });
});

router.get("/audit", async (_req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
  res.json({ success: true, logs });
});

router.get("/identity/:supplierId", async (req, res) => {
  const business = await Business.findById(req.params.supplierId).populate("ownerId");
  if (!business) return res.status(404).json({ success: false, message: "Not found" });
  res.json({
    success: true,
    mapping: {
      listingCode: business.listingCode,
      shopName: business.shopName,
      gst: business.gst,
      address: business.address,
      owner: business.ownerId?.name,
      phone: business.ownerId?.phone,
      email: business.ownerId?.email,
    },
  });
});

router.get("/imei/:orderId", async (req, res) => {
  const unit = await DeviceUnit.findOne({ orderId: req.params.orderId });
  if (!unit) return res.status(404).json({ success: false, message: "No unit linked" });
  const imei = decryptSecret(unit.imeiEncrypted);
  res.json({
    success: true,
    masked: maskImei(imei),
    imei,
    serial: decryptSecret(unit.serialEncrypted),
    scanEvents: unit.scanEvents,
  });
});

router.get("/kpis", async (_req, res) => {
  const [activeSuppliers, liveSkus, inventory, orders, settlements, disputes] = await Promise.all([
    Business.countDocuments({ role: "supplier", verified: true, status: "active" }),
    Sku.countDocuments(),
    Inventory.find({ status: "ON" }),
    Order.find(),
    Settlement.find(),
    Dispute.countDocuments({ status: "open" }),
  ]);
  const verifiedStockUnits = inventory.reduce((s, i) => s + i.availableQty, 0);
  const gmv = orders.filter((o) => ["delivered", "settled", "paid", "picked", "assigned", "packing"].includes(o.status)).reduce((s, o) => s + (o.totals?.landedPrice || 0), 0);
  const fees = settlements.reduce((s, x) => s + (x.platformFee || 0), 0);
  const filled = orders.filter((o) => ["delivered", "settled"].includes(o.status)).length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  res.json({
    success: true,
    kpis: {
      activeSuppliers,
      liveSkus,
      verifiedStockUnits,
      searchToOrderHint: "Track from catalog search events in later analytics.",
      orderFillRate: orders.length ? Math.round((filled / orders.length) * 100) : 0,
      cancellationRate: orders.length ? Math.round((cancelled / orders.length) * 100) : 0,
      gmv,
      platformFee: fees,
      disputesOpen: disputes,
      orders: orders.length,
    },
  });
});

router.post("/auto-assign", async (_req, res) => {
  const packing = await Order.find({ status: "packing" });
  const rider = await User.findOne({ role: "rider", dutyOn: true, status: "active" });
  if (!rider) return res.json({ success: true, assigned: 0, message: "No rider on duty" });
  let assigned = 0;
  for (const order of packing) {
    const exists = await Shipment.findOne({ orderId: order._id, status: { $in: ["assigned", "picked", "delivered"] } });
    if (exists) continue;
    const { default: assignRouter } = await import("./shipments.js");
    void assignRouter;
    const supplier = await Business.findById(order.supplierId);
    const buyer = await User.findById(order.buyerId);
    const { generateOtp, hashOtp } = await import("../utils/crypto.js");
    const pickupOtp = generateOtp();
    const deliveryOtp = generateOtp();
    await Shipment.create({
      orderId: order._id,
      riderId: rider._id,
      pickup: {
        lat: supplier.location?.lat,
        lng: supplier.location?.lng,
        address: supplier.address,
        shopName: supplier.shopName,
      },
      drop: {
        lat: buyer.location?.lat,
        lng: buyer.location?.lng,
        address: buyer.location?.label,
        shopName: "Buyer retailer",
      },
      pickupOtpHash: hashOtp(pickupOtp),
      deliveryOtpHash: hashOtp(deliveryOtp),
      demoPickupOtp: pickupOtp,
      demoDeliveryOtp: deliveryOtp,
      timestamps: { assignedAt: new Date() },
      status: "assigned",
    });
    order.status = "assigned";
    order.events.push({ name: "riderassigned", at: new Date() });
    await order.save();
    assigned += 1;
  }
  res.json({ success: true, assigned });
});

export default router;
