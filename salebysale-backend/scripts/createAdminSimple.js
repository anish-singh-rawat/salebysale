import "dotenv/config";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

/**
 * Simple script to create Admin users
 * 
 * Edit the adminConfig below and run:
 * node scripts/createAdminSimple.js
 */

// ====== EDIT THIS SECTION ======
const adminConfig = {
  name: "Super Admin",
  email: "admin@salebysale.com",
  phone: "+919999999999",
  password: "Admin@123",
};
// ===============================

async function createAdmin() {
  try {
    console.log("📦 Connecting to database...");
    await connectDB();
    console.log("✅ Connected!\n");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminConfig.email });
    if (existingAdmin) {
      console.log("❌ Error: Admin with this email already exists!\n");
      console.log("Existing Admin Details:");
      console.log("==========================================");
      console.log(`Name:     ${existingAdmin.name}`);
      console.log(`Email:    ${existingAdmin.email}`);
      console.log(`Phone:    ${existingAdmin.phone}`);
      console.log(`Role:     ${existingAdmin.role}`);
      console.log(`Status:   ${existingAdmin.kycStatus} / ${existingAdmin.status}`);
      console.log(`ID:       ${existingAdmin._id}`);
      console.log("==========================================\n");
      console.log("💡 Tip: Change the email in adminConfig or delete this admin first.");
      process.exit(1);
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminConfig.password, salt);

    // Create admin user
    console.log("👤 Creating admin user...");
    const admin = await User.create({
      name: adminConfig.name,
      email: adminConfig.email.toLowerCase(),
      phone: adminConfig.phone,
      passwordHash,
      role: "admin",
      kycStatus: "verified",
      verified: true,
      status: "active",
    });

    console.log("\n✅ Admin created successfully!\n");
    console.log("==========================================");
    console.log("Admin Login Credentials:");
    console.log("==========================================");
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${adminConfig.password}`);
    console.log(`Phone:    ${admin.phone}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`Status:   ${admin.kycStatus} / ${admin.status}`);
    console.log(`ID:       ${admin._id}`);
    console.log("==========================================\n");

    console.log("🎉 You can now login to the admin panel:");
    console.log(`   URL:      http://localhost:5174/login`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${adminConfig.password}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin:");
    console.error(error.message);
    process.exit(1);
  }
}

createAdmin();
