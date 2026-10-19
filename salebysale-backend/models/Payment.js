import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: Number,
    gatewayRef: String,
    status: { type: String, enum: ["authorized", "captured", "refunded", "failed"], default: "authorized" },
    fee: Number,
    payout: Number,
    refund: { type: Number, default: 0 },
    reconciliation: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
