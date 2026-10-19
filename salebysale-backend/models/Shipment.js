import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pickup: { lat: Number, lng: Number, address: String, shopName: String },
    drop: { lat: Number, lng: Number, address: String, shopName: String },
    pickupOtpHash: String,
    deliveryOtpHash: String,
    demoPickupOtp: String,
    demoDeliveryOtp: String,
    proof: { photoUrl: String, notes: String },
    failedReason: String,
    timestamps: {
      assignedAt: Date,
      pickedAt: Date,
      deliveredAt: Date,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "picked", "delivered", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shipment", shipmentSchema);
