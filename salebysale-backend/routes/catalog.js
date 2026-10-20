import { Router } from "express";
import Sku from "../models/Sku.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.get("/search", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const filter = q
    ? {
        $or: [
          { brand: new RegExp(q, "i") },
          { model: new RegExp(q, "i") },
          { variant: new RegExp(q, "i") },
          { color: new RegExp(q, "i") },
          { skuCode: new RegExp(q, "i") },
        ],
      }
    : {};
  const skus = await Sku.find(filter).limit(50);
  res.json({ success: true, skus });
});

// Public paginated catalog — all SKUs, no auth needed
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const q = String(req.query.q || "").trim();
  const filter = q
    ? {
        $or: [
          { brand: new RegExp(q, "i") },
          { model: new RegExp(q, "i") },
          { variant: new RegExp(q, "i") },
          { color: new RegExp(q, "i") },
          { skuCode: new RegExp(q, "i") },
        ],
      }
    : {};
  const [skus, total] = await Promise.all([
    Sku.find(filter)
      .sort({ brand: 1, model: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Sku.countDocuments(filter),
  ]);
  res.json({ success: true, skus, total, page, pages: Math.ceil(total / limit) });
});

// Suppliers (and admins) can create SKUs
router.post("/", auth, allow("supplier", "admin"), async (req, res) => {
  // If SKU with same skuCode already exists, return it instead of erroring
  const existing = await Sku.findOne({ skuCode: req.body.skuCode });
  if (existing) return res.status(200).json({ success: true, sku: existing });

  const sku = await Sku.create({
    ...req.body,
    searchText: `${req.body.brand} ${req.body.model} ${req.body.variant} ${req.body.color}`,
  });
  res.status(201).json({ success: true, sku });
});

export default router;
