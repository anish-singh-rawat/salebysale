import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Sku from "../models/Sku.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import Shipment from "../models/Shipment.js";
import Payment from "../models/Payment.js";
import Settlement from "../models/Settlement.js";
import DeviceUnit from "../models/DeviceUnit.js";
import AuditLog from "../models/AuditLog.js";
import Dispute from "../models/Dispute.js";

const shops = [
  { shopName: "Shiv Ganga Mobile", area: "Jwalapur", lat: 29.9265, lng: 78.1178, gst: "05AABCS1111A1Z1" },
  { shopName: "Haridwar Mobiles Hub", area: "Bahadrabad", lat: 29.9112, lng: 78.0401, gst: "05AABCS2222A1Z2" },
  { shopName: "Shivalik Gadget Point", area: "Shivalik Nagar", lat: 29.9178, lng: 78.0614, gst: "05AABCS3333A1Z3" },
  { shopName: "Ganga Valley Phones", area: "Kankhal", lat: 29.9331, lng: 78.1452, gst: "05AABCS4444A1Z4" },
  { shopName: "BHEL Sector Mobile", area: "BHEL", lat: 29.9374, lng: 78.0702, gst: "05AABCS5555A1Z5" },
  { shopName: "Ranipur Handset Mart", area: "Ranipur", lat: 29.9488, lng: 78.1294, gst: "05AABCS6666A1Z6" },
  { shopName: "Sidcul Express Mobiles", area: "SIDCUL", lat: 29.958, lng: 78.068, gst: "05AABCS7777A1Z7" },
  { shopName: "Mayapur Mobile World", area: "Mayapur", lat: 29.9522, lng: 78.1591, gst: "05AABCS8888A1Z8" },
  { shopName: "Jatwara Smart Store", area: "Jatwara", lat: 29.9614, lng: 78.1422, gst: "05AABCS9999A1Z9" },
  { shopName: "Har Ki Pauri Gadgets", area: "Har Ki Pauri", lat: 29.9569, lng: 78.171, gst: "05AABCS0000A1Z0" },
];

const catalog = [
  { skuCode: "OPPO-A58-8-128-GLOW", brand: "OPPO", model: "A58", variant: "8/128", ram: "8GB", storage: "128GB", color: "Glowing Black" },
  { skuCode: "OPPO-A58-8-128-BLUE", brand: "OPPO", model: "A58", variant: "8/128", ram: "8GB", storage: "128GB", color: "Dazzling Blue" },
  { skuCode: "VIVO-T3X-8-128-GREEN", brand: "vivo", model: "T3x", variant: "8/128", ram: "8GB", storage: "128GB", color: "Crimson Bliss" },
  { skuCode: "REDMI-13C-6-128-BLACK", brand: "Redmi", model: "13C", variant: "6/128", ram: "6GB", storage: "128GB", color: "Stardust Black" },
  { skuCode: "SAMSUNG-A15-8-128-BLUE", brand: "Samsung", model: "Galaxy A15", variant: "8/128", ram: "8GB", storage: "128GB", color: "Blue Black" },
  { skuCode: "REALME-NARZO-8-128-GOLD", brand: "realme", model: "Narzo 70", variant: "8/128", ram: "8GB", storage: "128GB", color: "Champion Gold" },
];

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Business.deleteMany({}),
    Sku.deleteMany({}),
    Inventory.deleteMany({}),
    Order.deleteMany({}),
    Reservation.deleteMany({}),
    Shipment.deleteMany({}),
    Payment.deleteMany({}),
    Settlement.deleteMany({}),
    DeviceUnit.deleteMany({}),
    AuditLog.deleteMany({}),
    Dispute.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Demo@123", 10);

  const admin = await User.create({
    name: "SELL BY SELL Admin",
    email: "admin@sellbysell.com",
    phone: "9000000001",
    passwordHash,
    role: "admin",
    kycStatus: "verified",
    verified: true,
    location: { lat: 29.9457, lng: 78.1642, label: "Haridwar HQ" },
  });

  const skus = await Sku.insertMany(
    catalog.map((s) => ({ ...s, region: "India", warranty: "Brand 1 Year", condition: "new_sealed", searchText: `${s.brand} ${s.model} ${s.variant} ${s.color}` }))
  );

  const suppliers = [];
  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    const user = await User.create({
      name: `${shop.shopName} Owner`,
      email: `supplier${i + 1}@sellbysell.com`,
      phone: `90100000${String(i + 1).padStart(2, "0")}`,
      passwordHash,
      role: "supplier",
      kycStatus: "verified",
      verified: true,
      location: { lat: shop.lat, lng: shop.lng, label: shop.area },
    });
    const business = await Business.create({
      ownerId: user._id,
      role: "supplier",
      shopName: shop.shopName,
      gst: shop.gst,
      address: `${shop.shopName}, ${shop.area}, Haridwar`,
      area: shop.area,
      location: { lat: shop.lat, lng: shop.lng, label: shop.area },
      kycStatus: "verified",
      verified: true,
      reliability: 70 + i * 2,
      listingCode: `SBS-HWR-${String(i + 1).padStart(2, "0")}`,
    });
    user.businessId = business._id;
    await user.save();
    suppliers.push({ user, business });
  }

  const buyerUser = await User.create({
    name: "Ramesh Retailer",
    email: "buyer@sellbysell.com",
    phone: "9020000001",
    passwordHash,
    role: "buyer",
    kycStatus: "verified",
    verified: true,
    location: { lat: 29.9457, lng: 78.1642, label: "Jwalapur Market" },
  });
  const buyerBiz = await Business.create({
    ownerId: buyerUser._id,
    role: "buyer",
    shopName: "Ramesh Mobile Corner",
    gst: "05AABCB1111B1Z1",
    address: "Jwalapur Market, Haridwar",
    area: "Jwalapur",
    location: buyerUser.location,
    kycStatus: "verified",
    verified: true,
    listingCode: "SBS-BUY-01",
  });
  buyerUser.businessId = buyerBiz._id;
  await buyerUser.save();

  const rider = await User.create({
    name: "Amit Rider",
    email: "rider@sellbysell.com",
    phone: "9030000001",
    passwordHash,
    role: "rider",
    kycStatus: "verified",
    verified: true,
    dutyOn: true,
    location: { lat: 29.94, lng: 78.14, label: "Haridwar" },
  });

  const floors = [10000, 10150, 9980, 10400, 18990, 15490];
  for (let s = 0; s < suppliers.length; s++) {
    for (let k = 0; k < skus.length; k++) {
      if ((s + k) % 4 === 0) continue;
      await Inventory.create({
        supplierId: suppliers[s].business._id,
        skuId: skus[k]._id,
        availableQty: 1 + ((s + k) % 4),
        reservedQty: 0,
        minimumPrice: floors[k] + s * 20,
        lastVerifiedAt: new Date(),
        readyInMinutes: 5 + (s % 3) * 5,
        status: "ON",
      });
    }
  }

  console.log("Seed complete");
  console.log("Login (password Demo@123):");
  console.log("  admin@sellbysell.com");
  console.log("  supplier1@sellbysell.com  (Shiv Ganga Mobile)");
  console.log("  buyer@sellbysell.com");
  console.log("  rider@sellbysell.com");
  console.log({ admin: admin.email, rider: rider.email, skus: skus.length, shops: suppliers.length });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
