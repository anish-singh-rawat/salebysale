import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["supplier", "buyer"], required: true },
    shopName: { type: String, required: true },
    gst: String,
    address: String,
    area: String,
    location: { lat: Number, lng: Number, label: String },
    kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    reliability: { type: Number, default: 80 },
    listingCode: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
