import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "supplier", "buyer", "rider"],
      required: true,
    },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    dutyOn: { type: Boolean, default: false },
    location: {
      lat: Number,
      lng: Number,
      label: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
