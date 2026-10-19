import { Router } from "express";
import Shipment from "../models/Shipment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Settlement from "../models/Settlement.js";
import DeviceUnit from "../models/DeviceUnit.js";
import { auth, allow } from "../middleware/auth.js";
import { generateOtp, hashOtp } from "../utils/crypto.js";
import { emitEvent } from "../utils/audit.js";

const router = Router();

router.post("/assign", auth, allow("admin"), async (req, res) => {
  const { orderId, riderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  const rider = await User.findOne({ _id: riderId, role: "rider" });
  if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
  const supplier = await Business.findById(order.supplierId);
  const buyer = await User.findById(order.buyerId);
  const pickupOtp = generateOtp();
  const deliveryOtp = generateOtp();
  let shipment = await Shipment.findOne({ orderId });
  if (!shipment) {
    shipment = await Shipment.create({
      orderId,
      riderId,
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
  } else {
    shipment.riderId = riderId;
    shipment.pickupOtpHash = hashOtp(pickupOtp);
    shipment.deliveryOtpHash = hashOtp(deliveryOtp);
    shipment.demoPickupOtp = pickupOtp;
    shipment.demoDeliveryOtp = deliveryOtp;
    shipment.timestamps.assignedAt = new Date();
    shipment.status = "assigned";
    await shipment.save();
  }
  order.status = "assigned";
  order.events.push({ name: "riderassigned", at: new Date() });
  await order.save();
  emitEvent("riderassigned", { orderId, riderId });
  res.json({ success: true, shipment });
});

router.get("/mine", auth, allow("rider"), async (req, res) => {
  const rows = await Shipment.find({ riderId: req.user._id }).sort({ createdAt: -1 }).populate("orderId");
  res.json({ success: true, shipments: rows });
});

router.post("/:id/pickup", auth, allow("rider"), async (req, res) => {
  const shipment = await Shipment.findOne({ _id: req.params.id, riderId: req.user._id });
  if (!shipment) return res.status(404).json({ success: false, message: "Not found" });
  if (hashOtp(req.body.otp) !== shipment.pickupOtpHash) {
    return res.status(400).json({ success: false, message: "Invalid pickup OTP" });
  }
  shipment.status = "picked";
  shipment.timestamps.pickedAt = new Date();
  await shipment.save();
  await Order.updateOne({ _id: shipment.orderId }, { $set: { status: "picked" }, $push: { events: { name: "pickupverified", at: new Date() } } });
  await DeviceUnit.updateOne({ orderId: shipment.orderId }, { $push: { scanEvents: { actor: "rider", at: new Date(), kind: "pickup_scan" } } });
  emitEvent("pickupverified", { shipmentId: shipment._id });
  res.json({ success: true, shipment });
});

router.post("/:id/deliver", auth, allow("rider"), async (req, res) => {
  const shipment = await Shipment.findOne({ _id: req.params.id, riderId: req.user._id });
  if (!shipment) return res.status(404).json({ success: false, message: "Not found" });
  if (hashOtp(req.body.otp) !== shipment.deliveryOtpHash) {
    return res.status(400).json({ success: false, message: "Invalid delivery OTP" });
  }
  shipment.status = "delivered";
  shipment.proof = { photoUrl: req.body.photoUrl || "demo-proof", notes: req.body.notes };
  shipment.timestamps.deliveredAt = new Date();
  await shipment.save();
  const order = await Order.findById(shipment.orderId);
  order.status = "delivered";
  order.events.push({ name: "delivered", at: new Date() });
  await order.save();
  await Settlement.create({
    orderId: order._id,
    supplierId: order.supplierId,
    payout: order.totals.supplierPayout,
    platformFee: order.totals.platformFee,
    deliveryCharge: order.totals.deliveryCharge,
    status: "eligible",
  });
  order.status = "settled";
  order.events.push({ name: "settlementeligible", at: new Date() });
  await order.save();
  emitEvent("delivered", { orderId: order._id });
  emitEvent("settlementeligible", { orderId: order._id });
  res.json({ success: true, shipment, orderId: order._id });
});

router.post("/:id/fail", auth, allow("rider"), async (req, res) => {
  const shipment = await Shipment.findOne({ _id: req.params.id, riderId: req.user._id });
  if (!shipment) return res.status(404).json({ success: false, message: "Not found" });
  shipment.status = "failed";
  shipment.failedReason = req.body.reason;
  await shipment.save();
  await Order.updateOne({ _id: shipment.orderId }, { $set: { status: "disputed" } });
  res.json({ success: true, shipment });
});

export default router;
