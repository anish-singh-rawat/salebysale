import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
    qty: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
    state: { type: String, enum: ["active", "consumed", "released"], default: "active" },
  },
  { timestamps: true }
);

reservationSchema.index({ expiresAt: 1, state: 1 });

export default mongoose.model("Reservation", reservationSchema);
