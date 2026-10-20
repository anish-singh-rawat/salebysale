import { Router } from "express";
import Inventory from "../models/Inventory.js";
import Sku from "../models/Sku.js";
import User from "../models/User.js";
import Business from "../models/Business.js";
import { auth, allow } from "../middleware/auth.js";
import { isStale } from "../services/inventoryService.js";
import { haversineKm, quoteLandedPrice, etaMinutesForKm, matchScore } from "../utils/pricing.js";

const router = Router();

router.get("/availability", auth, async (req, res) => {
  const skuId = req.query.sku_id || req.query.skuId;
  if (!skuId) return res.status(400).json({ success: false, message: "sku_id required" });
  const sku = await Sku.findById(skuId);
  if (!sku) return res.status(404).json({ success: false, message: "SKU not found" });

  const buyer = req.user;
  const listings = await Inventory.find({ skuId, status: "ON", availableQty: { $gt: 0 } }).populate("supplierId");
  const ridersOn = await User.countDocuments({ role: "rider", dutyOn: true, status: "active" });

  const offers = listings
    .filter((inv) => !isStale(inv) && inv.supplierId?.verified)
    .map((inv) => {
      const km = haversineKm(buyer.location, inv.supplierId.location);
      const sellable = Math.max(0, inv.availableQty - inv.reservedQty);
      const pricing = quoteLandedPrice({ floorPrice: inv.minimumPrice, km });
      const eta = etaMinutesForKm(km, inv.readyInMinutes);
      const score = matchScore({
        price: pricing.landedPrice,
        km,
        readyInMinutes: inv.readyInMinutes,
        reliability: inv.supplierId.reliability,
        riderAvailable: ridersOn > 0,
      });
      return {
        inventoryId: inv._id,
        listingLabel: "SELL BY SELL verified stock",
        sku: {
          _id: sku._id,
          brand: sku.brand,
          model: sku.model,
          variant: sku.variant,
          ram: sku.ram,
          storage: sku.storage,
          color: sku.color,
          warranty: sku.warranty,
          condition: sku.condition,
        },
        availableQty: sellable,
        primaryImage: inv.primaryImage,
        images: inv.images,
        pricing: {
          landedPrice: pricing.landedPrice,
          deliveryCharge: pricing.deliveryCharge,
          tax: pricing.tax,
        },
        eta,
        returnPolicy: "DOA / wrong IMEI within 48 hours with sealed-box proof.",
      };
    })
    .filter((o) => o.availableQty > 0)
    .sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    sku,
    riderAvailable: ridersOn > 0,
    offers,
  });
});

export default router;
