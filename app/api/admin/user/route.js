import User from "@models/User";
import { connectToDB } from "@mongodb";
import { hash } from 'bcryptjs';


// GET all users
export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allUsers = await User.find();

    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all users", { status: 500 });
  }
};

// POST (Create new user)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { username, email, khoa, role, maNgach, hocHamHocVi, donViQuanLy, maGV } = await req.json();
    const hashedPassword = await hash("123456@", 10);

    // Kiểm tra email đã tồn tại
    let newUser = await User.findOne({ email });

    if (newUser) {
      // Nếu tồn tại, cập nhật thông tin
      newUser = { username, email, khoa, role, maNgach, hocHamHocVi, donViQuanLy, maGV }
      await newUser.save();

      return new Response(JSON.stringify(newUser), { status: 200 });
    } else {
      // Nếu chưa tồn tại, tạo mới user
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        khoa,
        role,
        maNgach, hocHamHocVi, donViQuanLy,  maGV
      });

      await newUser.save();
      return new Response(JSON.stringify(newUser), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update user", { status: 500 });
  }
};


// PUT (Update existing user)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id, username, email, khoa, role, maNgach, hocHamHocVi, donViQuanLy, maGV } = await req.json();

    let userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return new Response("User not found", { status: 404 });
    }

    userToUpdate.username = username;
    userToUpdate.email = email;
    userToUpdate.khoa = khoa;
    userToUpdate.role = role;
    userToUpdate.maNgach = maNgach;
    userToUpdate.hocHamHocVi = hocHamHocVi;
    userToUpdate.donViQuanLy = donViQuanLy;
    userToUpdate.maGV = maGV;

    await userToUpdate.save();

    return new Response(JSON.stringify(userToUpdate), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update user", { status: 500 });
  }
};

export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa user
    const userToDelete = await User.findByIdAndDelete(id);

    if (!userToDelete) {
      return new Response("User not found", { status: 404 });
    }

    return new Response("User deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete user", { status: 500 });
  }
};
