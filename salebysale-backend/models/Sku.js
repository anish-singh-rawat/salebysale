import mongoose from "mongoose";

const skuSchema = new mongoose.Schema(
  {
    skuCode: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, required: true },
    ram: String,
    storage: String,
    color: { type: String, required: true },
    region: { type: String, default: "India" },
    warranty: { type: String, default: "Brand 1 Year" },
    condition: { type: String, default: "new_sealed" },
    searchText: String,
  },
  { timestamps: true }
);

skuSchema.index({ brand: 1, model: 1, color: 1 });
skuSchema.index({ searchText: "text" });

export default mongoose.model("Sku", skuSchema);
