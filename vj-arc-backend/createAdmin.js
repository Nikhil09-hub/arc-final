const dns = require("dns");

// Use reliable public DNS servers for MongoDB SRV resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./src/models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@vjarc.com";
    const password = "ChangeThisPassword123!";

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log("Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();