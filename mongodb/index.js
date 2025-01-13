import mongoose from 'mongoose';
import User from '@models/User';
import { hash } from 'bcryptjs';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "HaloChat",
    });

    isConnected = true;
    console.log("MongoDB is connected successfully");

    const adminEmail = "admin@gmail.com";
    const adminPassword = "123456@";

    // Kiểm tra tài khoản admin
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Xóa tài khoản admin nếu đã tồn tại
      await User.deleteOne({ email: adminEmail });
      console.log("Existing admin user deleted");
    }

    // Tạo tài khoản admin mới
    const hashedPassword = await hash(adminPassword, 10);
    const adminUser = new User({
      username: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    await adminUser.save();
    console.log('Admin user created successfully');

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
