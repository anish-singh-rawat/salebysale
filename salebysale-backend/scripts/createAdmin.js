import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

/**
 * Script to create Admin/Super Admin users
 * 
 * Usage:
 * node scripts/createAdmin.js
 * 
 * You will be prompted to enter admin details
 */

async function createAdmin() {
  try {
    await connectDB();
    console.log("📦 Connected to database\n");

    // Get admin details from command line or use defaults
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query) =>
      new Promise((resolve) => rl.question(query, resolve));

    console.log("=== Create Admin/Super Admin ===\n");

    const name = await question("Admin Name (default: Super Admin): ");
    const email = await question("Admin Email (default: admin@salebysale.com): ");
    const phone = await question("Admin Phone (default: +919999999999): ");
    const password = await question("Admin Password (default: Admin@123): ");

    rl.close();

    // Use defaults if not provided
    const adminData = {
      name: name.trim() || "Super Admin",
      email: email.trim().toLowerCase() || "admin@salebysale.com",
      phone: phone.trim() || "+919999999999",
      password: password.trim() || "Admin@123",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("\n❌ Error: Admin with this email already exists!");
      console.log(`Email: ${adminData.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Status: ${existingAdmin.kycStatus}`);
      console.log("\nTip: Use a different email or delete the existing admin first.");
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone,
      passwordHash,
      role: "admin",
      kycStatus: "verified",
      verified: true,
      status: "active",
    });

    console.log("\n✅ Admin created successfully!\n");
    console.log("==========================================");
    console.log("Admin Details:");
    console.log("==========================================");
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Phone:    ${admin.phone}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`Status:   ${admin.kycStatus} / ${admin.status}`);
    console.log(`ID:       ${admin._id}`);
    console.log("==========================================\n");

    console.log("🎉 You can now login to the admin panel:");
    console.log(`   http://localhost:5174/login`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminData.password}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

// Alternative: Create admin without prompts (for quick setup)
async function createQuickAdmin(email, password, name = "Admin") {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("❌ Admin already exists with email:", email);
      return existingAdmin;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      phone: "+919999999999",
      passwordHash,
      role: "admin",
      kycStatus: "verified",
      verified: true,
      status: "active",
    });

    console.log("✅ Admin created:", admin.email);
    return admin;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Check if script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length >= 2) {
    // Quick mode: node createAdmin.js email@example.com Password123 "Admin Name"
    const [email, password, name] = args;
    createQuickAdmin(email, password, name || "Admin")
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    // Interactive mode
    createAdmin();
  }
}

export { createAdmin, createQuickAdmin };
