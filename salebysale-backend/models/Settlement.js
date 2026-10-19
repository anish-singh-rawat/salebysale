import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    payout: Number,
    platformFee: Number,
    deliveryCharge: Number,
    status: { type: String, enum: ["eligible", "paid", "held"], default: "eligible" },
    payoutRule: { type: String, default: "T+1 after delivery" },
  },
  { timestamps: true }
);

export default mongoose.model("Settlement", settlementSchema);
