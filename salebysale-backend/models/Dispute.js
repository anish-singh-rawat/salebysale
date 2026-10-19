import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String,
    status: { type: String, enum: ["open", "review", "resolved"], default: "open" },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);
