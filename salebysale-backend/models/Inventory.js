import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    skuId: { type: mongoose.Schema.Types.ObjectId, ref: "Sku", required: true },
    availableQty: { type: Number, default: 0 },
    reservedQty: { type: Number, default: 0 },
    minimumPrice: { type: Number, required: true },
    lastVerifiedAt: { type: Date, default: Date.now },
    readyInMinutes: { type: Number, default: 5 },
    status: { type: String, enum: ["ON", "OFF", "STALE"], default: "ON" },
    images: { type: [String], default: [] },
    primaryImage: { type: String, default: null },
  },
  { timestamps: true }
);

inventorySchema.index({ supplierId: 1, skuId: 1 }, { unique: true });
inventorySchema.index({ skuId: 1, status: 1 });

export default mongoose.model("Inventory", inventorySchema);
