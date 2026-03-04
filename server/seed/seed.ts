import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/config/database";
import User from "../src/models/User";
import Product from "../src/models/Product";
import sampleProducts from "./sampleProducts";

connectDB();

const importData = async () => {
  try {
    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "123456";
    const adminName = process.env.ADMIN_NAME || "Admin User";

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      console.log(
        `Admin user created - Email: ${adminEmail}, Password: ${adminPassword}`,
      );
    } else {
      console.log("Admin user already exists");
    }

    // Create sample products if none exist
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log("Sample products created");
    } else {
      console.log("Sample products already exist");
    }

    console.log("Data Import Success");
    process.exit();
  } catch (error) {
    console.error("Data Import Error:", error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    console.log("Data Destroyed");
    process.exit();
  } catch (error) {
    console.error("Data Destroy Error:", error);
    process.exit(1);
  }
};

console.log(">>>>>>>", process.argv[2]);
// Run based on command
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
