import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

async function seedAdmin() {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@campus.local";
    const password = process.env.ADMIN_PASSWORD || "Admin@12345";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "System Admin",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:");
    console.error(error.message);

    process.exit(1);
  }
}

seedAdmin();