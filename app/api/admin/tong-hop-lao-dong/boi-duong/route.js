import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import BoiDuong from "@models/BoiDuong";

export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { user, congTacGiangDay, loai, namHoc } = body;

    // Kiểm tra xem bản ghi đã tồn tại chưa
    const existingRecord = await BoiDuong.findOne({ user, loai, namHoc });

    if (existingRecord) {
      // Nếu bản ghi đã tồn tại, cập nhật bản ghi
      const updatedRecord = await BoiDuong.findByIdAndUpdate(
        existingRecord._id,
        {
          congTacGiangDay,
          // Luôn cập nhật trạng thái về 0 (Chờ duyệt) khi giảng viên gửi lại
          trangThai: 0
        },
        { new: true }
      );
      return new Response(JSON.stringify(updatedRecord), { status: 200 });
    } else {
      // Nếu không tồn tại, tạo bản ghi mới
      const newRecord = await BoiDuong.create({
        user,
        congTacGiangDay,
        loai,
        namHoc,
        trangThai: 0 // Mặc định là Chờ duyệt
      });
      return new Response(JSON.stringify(newRecord), { status: 200 });
    }
  } catch (error) {
    return new Response("Lỗi khi lưu dữ liệu", { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    await connectToDB();
    const { id } = await req.json();
    await BoiDuong.findByIdAndDelete(id);
    return new Response(`$Deleted successfully`, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to delete record`, { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    await connectToDB();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const records = await BoiDuong.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).populate('user', 'username');

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


