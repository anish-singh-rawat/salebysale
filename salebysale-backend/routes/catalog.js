import { Router } from "express";
import Sku from "../models/Sku.js";
import { auth } from "../middleware/auth.js";

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

export default router;
