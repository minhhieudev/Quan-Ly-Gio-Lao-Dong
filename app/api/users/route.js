import User from "@models/User"
import { connectToDB } from "@mongodb"
import { hash, compare } from "bcryptjs";

export const GET = async (req, res) => {
  try {
    await connectToDB()

    const allUsers = await User.find()

    return new Response(JSON.stringify(allUsers), { status: 200 })
  } catch (err) {
    console.log(err)
    return new Response("Failed to get all users", { status: 500 })
  }
}

// API đổi mật khẩu cho user
export const PUT = async (req) => {
  try {
    await connectToDB();
    const { userId, oldPassword, newPassword } = await req.json();
    if (!userId || !oldPassword || !newPassword) {
      return new Response("Missing required fields", { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    // So sánh mật khẩu cũ (dùng bcrypt.compare)
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      return new Response("Mật khẩu cũ không đúng", { status: 401 });
    }
    // Mã hóa mật khẩu mới
    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return new Response("Đổi mật khẩu thành công", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Đổi mật khẩu thất bại", { status: 500 });
  }
}