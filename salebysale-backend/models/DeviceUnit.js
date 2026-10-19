import mongoose from "mongoose";

const deviceUnitSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    imeiEncrypted: String,
    serialEncrypted: String,
    scanEvents: [{ actor: String, at: Date, kind: String }],
  },
  { timestamps: true }
);

export default mongoose.model("DeviceUnit", deviceUnitSchema);
