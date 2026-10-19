import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/businesses.js";
import catalogRoutes from "./routes/catalog.js";
import inventoryRoutes from "./routes/inventory.js";
import supplierRoutes from "./routes/supplier.js";
import orderRoutes from "./routes/orders.js";
import shipmentRoutes from "./routes/shipments.js";
import adminRoutes from "./routes/admin.js";
import riderRoutes from "./routes/riders.js";
import { startJobs } from "./jobs/expireReservations.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    product: "SELL BY SELL",
    tagline: "Stock किसी के भी हो, Sale आपकी होगी!",
    version: "2.0",
  });
});

app.use("/auth", authRoutes);
app.use("/businesses", businessRoutes);
app.use("/catalog", catalogRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/supplier", supplierRoutes);
app.use("/orders", orderRoutes);
app.use("/shipments", shipmentRoutes);
app.use("/admin", adminRoutes);
app.use("/riders", riderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ success: false, message: err.message || "Request failed" });
});

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  await connectDB();
  startJobs();
  app.listen(PORT, () => {
    console.log(`SELL BY SELL API on http://localhost:${PORT}`);
  });
};

startServer();
