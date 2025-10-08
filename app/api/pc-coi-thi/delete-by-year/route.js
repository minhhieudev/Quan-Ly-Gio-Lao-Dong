export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcCoiThi from '@models/PcCoiThi';

// DELETE - Xóa dữ liệu theo năm học và loại hình đào tạo
export const DELETE = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    // Lấy dữ liệu từ request body
    const { namHoc, loai, ky, loaiKyThi } = await req.json();

    // Kiểm tra các tham số bắt buộc
    if (!namHoc) {
      return new Response("Năm học là bắt buộc.", { status: 400 });
    }

    // Tạo điều kiện tìm kiếm
    let filter = { namHoc };

    // Thêm loại hình đào tạo nếu có
    if (loai && loai !== 'undefined') {
      filter.type = loai;
    }

    // Thêm kỳ học nếu có
    if (ky && ky !== 'undefined') {
      filter.ky = ky;
    }
    // Thêm kỳ học nếu có
    if (loaiKyThi && loaiKyThi !== 'undefined') {
      filter.loaiKyThi = loaiKyThi;
    }

    // Đếm số bản ghi sẽ bị xóa
    const countBeforeDelete = await PcCoiThi.countDocuments(filter);

    if (countBeforeDelete === 0) {
      return new Response(JSON.stringify({
        message: "Không tìm thấy bản ghi nào để xóa",
        deletedCount: 0
      }), { status: 200 });
    }

    // Xóa các bản ghi theo điều kiện
    const deleteResult = await PcCoiThi.deleteMany(filter);

    // Trả về phản hồi thành công
    return new Response(JSON.stringify({
      message: `Đã xóa thành công ${deleteResult.deletedCount} bản ghi`,
      deletedCount: deleteResult.deletedCount,
      namHoc,
      loai,
      ky,
      loaiKyThi
    }), { status: 200 });

  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error deleting PcCoiThi by year:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
