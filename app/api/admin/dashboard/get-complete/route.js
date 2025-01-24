import { connectToDB } from '@mongodb';
import TongHopLaoDong from "@models/TongHopLaoDong";
import Khoa from "@models/Khoa";
import User from "@models/User";

export const GET = async (req) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');

    // Lấy danh sách tất cả các khoa
    const khoas = await Khoa.find({});
    console.log('namHoc:',namHoc)
    
    // Khởi tạo object để lưu kết quả
    let result = {};

    // Xử lý từng khoa
    for (const khoa of khoas) {
      // Đếm tổng số giảng viên của khoa
      const totalUsers = await User.countDocuments({ 
        khoa: khoa.tenKhoa,
        role: "user" 
      });

      // Lấy danh sách user_id của giảng viên trong khoa
      const khoaUsers = await User.find({ 
        khoa: khoa.tenKhoa, 
        role: "user" 
      }).select('_id username');

      // Đếm số giảng viên đã nộp của khoa
      const completedUsers = await TongHopLaoDong.countDocuments({
        namHoc: namHoc,
        user: { $in: khoaUsers.map(user => user._id) }
      });

      // Lấy thông tin chi tiết về giảng viên và dữ liệu tổng hợp
      const listGV = await Promise.all(
        khoaUsers.map(async (user) => {
          const tongHopData = await TongHopLaoDong.findOne({
            user: user._id,
            namHoc: namHoc
          });

          return {
            username: user.username,
            tongGioChinhQuy: tongHopData?.tongGioChinhQuy || 0,
            thuaThieuGioLaoDong: tongHopData?.thuaThieuGioLaoDong || 0
          };
        })
      );

      // Thêm vào kết quả
      result[khoa.tenKhoa] = {
        current: completedUsers,
        total: totalUsers,
        listGV
      };
    }

    return new Response(JSON.stringify(result), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi lấy thống kê :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
