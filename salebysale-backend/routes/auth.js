import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Business from "../models/Business.js";
import { auth, signToken, publicUser } from "../middleware/auth.js";
import { audit } from "../utils/audit.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password, app } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });
  if (app === "users" && !["buyer", "supplier"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin and courier staff must use the admin console.",
    });
  }
  if (app === "admin" && !["admin", "rider"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Retailers and wholesalers must use the users app.",
    });
  }
  const token = signToken(user);
  const business = user.businessId ? await Business.findById(user.businessId) : null;
  res.json({ success: true, token, user: publicUser(user), business });
});

router.post("/register", async (req, res) => {
  const { name, email, phone, password, role, shopName, gst, address, area, lat, lng } = req.body;
  if (!["supplier", "buyer", "rider"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(409).json({ success: false, message: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    phone,
    passwordHash,
    role,
    kycStatus: "pending",
    verified: false,
    location: { lat: Number(lat) || 29.9457, lng: Number(lng) || 78.1642, label: area || "Haridwar" },
  });
  if (role === "supplier" || role === "buyer") {
    const listingCode = `SBS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const business = await Business.create({
      ownerId: user._id,
      role,
      shopName: shopName || `${name} Store`,
      gst,
      address,
      area,
      location: user.location,
      listingCode,
      kycStatus: "pending",
    });
    user.businessId = business._id;
    await user.save();
  }
  await audit({ actorId: user._id, role, action: "register", entity: "user", entityId: user._id });
  const token = signToken(user);
  res.status(201).json({ success: true, token, user: publicUser(user) });
});

router.get("/me", auth, async (req, res) => {
  const business = req.user.businessId ? await Business.findById(req.user.businessId) : null;
  res.json({ success: true, user: publicUser(req.user), business });
});

export default router;
