import { connectToDB } from '@mongodb';
import TongHopLaoDong from "@models/TongHopLaoDong";
import User from "@models/User";

export const GET = async (req) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');

    // Lấy tổng số giảng viên
    const totalGiangVien = await User.countDocuments({ role: "user" });

    // Lấy danh sách tất cả giảng viên
    const allGiangVien = await User.find({ role: "user" }).select('_id');
    const giangVienIds = allGiangVien.map(gv => gv._id);

    // Đếm số giảng viên đã hoàn thành (có trong TongHopLaoDong)
    const completed = await TongHopLaoDong.countDocuments({
      namHoc: namHoc,
      user: { $in: giangVienIds }
    });

    // Tính số giảng viên chưa hoàn thành
    const notCompleted = totalGiangVien - completed;

    const result = {
      total: totalGiangVien,
      completed: completed,
      notCompleted: notCompleted
    };

    return new Response(JSON.stringify(result), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi lấy thống kê count:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
