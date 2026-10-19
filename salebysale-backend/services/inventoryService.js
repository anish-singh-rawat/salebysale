import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Reservation from "../models/Reservation.js";
import { emitEvent } from "../utils/audit.js";

const STALE_HOURS = 6;

export function isStale(inv) {
  if (!inv.lastVerifiedAt) return true;
  const age = Date.now() - new Date(inv.lastVerifiedAt).getTime();
  return age > STALE_HOURS * 60 * 60 * 1000;
}

export async function hideStaleInventory() {
  const cutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
  await Inventory.updateMany(
    { lastVerifiedAt: { $lt: cutoff }, status: "ON" },
    { $set: { status: "STALE" } }
  );
}

export async function atomicReserve({ inventoryId, qty = 1, minutes, orderId = null }) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const inv = await Inventory.findOneAndUpdate(
      {
        _id: inventoryId,
        status: "ON",
        $expr: { $gte: [{ $subtract: ["$availableQty", "$reservedQty"] }, qty] },
      },
      { $inc: { reservedQty: qty } },
      { new: true, session }
    );
    if (!inv) {
      throw new Error("Unit not available");
    }
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    const [reservation] = await Reservation.create(
      [{ inventoryId, qty, expiresAt, state: "active", orderId }],
      { session }
    );
    await session.commitTransaction();
    emitEvent("stockreserved", { inventoryId, reservationId: reservation._id, qty });
    return { inventory: inv, reservation };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function releaseReservation(reservation) {
  if (!reservation || reservation.state !== "active") return;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const current = await Reservation.findOne({ _id: reservation._id, state: "active" }).session(session);
    if (!current) {
      await session.commitTransaction();
      return;
    }
    await Inventory.updateOne({ _id: current.inventoryId }, { $inc: { reservedQty: -current.qty } }).session(session);
    current.state = "released";
    await current.save({ session });
    await session.commitTransaction();
    emitEvent("stockreleased", { reservationId: current._id });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function consumeReservation(reservationId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const current = await Reservation.findOne({ _id: reservationId, state: "active" }).session(session);
    if (!current) throw new Error("Reservation not active");
    await Inventory.updateOne(
      { _id: current.inventoryId },
      { $inc: { reservedQty: -current.qty, availableQty: -current.qty } }
    ).session(session);
    current.state = "consumed";
    await current.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function expireReservations() {
  const due = await Reservation.find({ state: "active", expiresAt: { $lte: new Date() } });
  for (const r of due) {
    await releaseReservation(r);
  }
  return due.length;
}
