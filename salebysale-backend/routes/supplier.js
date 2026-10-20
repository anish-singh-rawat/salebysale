import { Router } from "express";
import Inventory from "../models/Inventory.js";
import Sku from "../models/Sku.js";
import Order from "../models/Order.js";
import Settlement from "../models/Settlement.js";
import DeviceUnit from "../models/DeviceUnit.js";
import { auth, allow } from "../middleware/auth.js";
import { encryptSecret } from "../utils/crypto.js";
import { audit, emitEvent } from "../utils/audit.js";
import { consumeReservation } from "../services/inventoryService.js";
import Reservation from "../models/Reservation.js";

const router = Router();

router.get("/inventory", auth, allow("supplier"), async (req, res) => {
  const rows = await Inventory.find({ supplierId: req.user.businessId }).populate("skuId");
  res.json({ success: true, inventory: rows });
});

router.post("/inventory", auth, allow("supplier"), async (req, res) => {
  const { skuId, availableQty, minimumPrice, readyInMinutes, status, images, primaryImage } = req.body;
  const sku = await Sku.findById(skuId);
  if (!sku) return res.status(404).json({ success: false, message: "SKU not found" });
  const row = await Inventory.findOneAndUpdate(
    { supplierId: req.user.businessId, skuId },
    {
      availableQty: Number(availableQty) || 0,
      minimumPrice: Number(minimumPrice),
      readyInMinutes: Number(readyInMinutes) || 5,
      status: status || "ON",
      images: images || [],
      primaryImage: primaryImage || (images && images.length > 0 ? images[0] : null),
      lastVerifiedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  await audit({
    actorId: req.user._id,
    role: "supplier",
    action: "inventory.upsert",
    entity: "inventory",
    entityId: row._id,
  });
  res.status(201).json({ success: true, inventory: row });
});

router.patch("/inventory/:id", auth, allow("supplier"), async (req, res) => {
  const row = await Inventory.findOne({ _id: req.params.id, supplierId: req.user.businessId });
  if (!row) return res.status(404).json({ success: false, message: "Not found" });
  const fields = ["availableQty", "minimumPrice", "readyInMinutes", "status", "images", "primaryImage"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) row[f] = req.body[f];
  });
  if (req.body.verify) row.lastVerifiedAt = new Date();
  if (row.status === "STALE") row.status = "ON";
  row.lastVerifiedAt = new Date();
  await row.save();
  res.json({ success: true, inventory: row });
});

// Note: Bulk upload does not support images - add images via POST/PATCH individual inventory items
router.post("/inventory/bulk", auth, allow("supplier"), async (req, res) => {
  const items = req.body.items || [];
  const saved = [];
  for (const item of items) {
    const sku = await Sku.findOne({ skuCode: item.skuCode });
    if (!sku) continue;
    const row = await Inventory.findOneAndUpdate(
      { supplierId: req.user.businessId, skuId: sku._id },
      {
        availableQty: Number(item.availableQty) || 0,
        minimumPrice: Number(item.minimumPrice),
        readyInMinutes: Number(item.readyInMinutes) || 5,
        status: item.status || "ON",
        lastVerifiedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    saved.push(row);
  }
  res.json({ success: true, count: saved.length, inventory: saved });
});

router.get("/orders", auth, allow("supplier"), async (req, res) => {
  const orders = await Order.find({ supplierId: req.user.businessId }).sort({ createdAt: -1 }).populate("items.skuId");
  res.json({ success: true, orders });
});

router.post("/orders/:id/accept", auth, allow("supplier"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, supplierId: req.user.businessId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.status !== "awaiting_accept" && order.status !== "reserved") {
    return res.status(400).json({ success: false, message: "Cannot accept this order" });
  }
  if (order.acceptDeadline && new Date() > order.acceptDeadline) {
    return res.status(400).json({ success: false, message: "Accept deadline passed" });
  }
  order.status = "accepted";
  order.events.push({ name: "supplieraccepted", at: new Date() });
  await order.save();
  emitEvent("supplieraccepted", { orderId: order._id });
  res.json({ success: true, order });
});

router.post("/orders/:id/reject", auth, allow("supplier"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, supplierId: req.user.businessId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  order.status = "rejected";
  order.events.push({ name: "supplierrejected", at: new Date(), note: req.body.reason });
  await order.save();
  const reservation = await Reservation.findOne({ orderId: order._id, state: "active" });
  if (reservation) {
    const { releaseReservation } = await import("../services/inventoryService.js");
    await releaseReservation(reservation);
  }
  res.json({ success: true, order });
});

router.post("/orders/:id/pack", auth, allow("supplier"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, supplierId: req.user.businessId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (!["accepted", "paid", "awaiting_admin", "assigned"].includes(order.status)) {
    return res.status(400).json({ success: false, message: "Order not ready to pack" });
  }
  const { imei, serial } = req.body;
  if (!imei) return res.status(400).json({ success: false, message: "IMEI required" });
  await DeviceUnit.create({
    orderId: order._id,
    inventoryId: order.items[0]?.inventoryId,
    imeiEncrypted: encryptSecret(imei),
    serialEncrypted: encryptSecret(serial || imei),
    scanEvents: [{ actor: "supplier", at: new Date(), kind: "pack" }],
  });
  const reservation = await Reservation.findOne({ orderId: order._id, state: "active" });
  if (reservation) await consumeReservation(reservation._id);
  order.status = "packing";
  order.events.push({ name: "packed", at: new Date() });
  await order.save();
  res.json({ success: true, order, message: "Sealed box packed. IMEI stored with restricted access." });
});

router.get("/settlements", auth, allow("supplier"), async (req, res) => {
  const rows = await Settlement.find({ supplierId: req.user.businessId }).sort({ createdAt: -1 });
  res.json({ success: true, settlements: rows });
});

export default router;
