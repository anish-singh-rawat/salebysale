import { Router } from "express";
import Business from "../models/Business.js";
import User from "../models/User.js";
import { auth, allow } from "../middleware/auth.js";
import { audit } from "../utils/audit.js";

const router = Router();

router.post("/verify", auth, allow("admin"), async (req, res) => {
  const { businessId, status } = req.body;
  const business = await Business.findById(businessId);
  if (!business) return res.status(404).json({ success: false, message: "Business not found" });
  business.kycStatus = status;
  business.verified = status === "verified";
  await business.save();
  await User.updateOne(
    { _id: business.ownerId },
    { kycStatus: status, verified: status === "verified" }
  );
  await audit({
    actorId: req.user._id,
    role: "admin",
    action: "business.verify",
    entity: "business",
    entityId: business._id,
    meta: { status },
  });
  res.json({ success: true, business });
});

export default router;
