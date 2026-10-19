import { Router } from "express";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.post("/duty", auth, allow("rider"), async (req, res) => {
  req.user.dutyOn = Boolean(req.body.on);
  if (req.body.lat) {
    req.user.location = {
      lat: Number(req.body.lat),
      lng: Number(req.body.lng),
      label: req.body.label || req.user.location?.label,
    };
  }
  await req.user.save();
  res.json({ success: true, dutyOn: req.user.dutyOn, location: req.user.location });
});

export default router;
