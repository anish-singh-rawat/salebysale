import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    skuId: { type: mongoose.Schema.Types.ObjectId, ref: "Sku", required: true },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    qty: { type: Number, default: 1 },
    listingLabel: String,
    pricing: Object,
    eta: Object,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    status: {
      type: String,
      enum: [
        "quoted",
        "reserved",
        "awaiting_admin",
        "awaiting_accept",
        "accepted",
        "rejected",
        "paid",
        "packing",
        "assigned",
        "picked",
        "delivered",
        "cancelled",
        "disputed",
        "settled",
      ],
      default: "quoted",
    },
    items: [orderItemSchema],
    totals: Object,
    sla: Object,
    returnPolicy: { type: String, default: "DOA / wrong IMEI: 48 hours. Buyer must keep sealed-box proof." },
    events: [{ name: String, at: Date, note: String }],
    acceptDeadline: Date,
    payment: {
      status: { type: String, default: "unpaid" },
      method: String,
      gatewayRef: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
