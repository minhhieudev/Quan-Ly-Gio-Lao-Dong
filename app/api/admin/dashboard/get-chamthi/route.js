import { connectToDB } from '@mongodb';
import PcChamThi from "@models/PcChamThi";
import dayjs from "dayjs"; // Dùng thư viện dayjs để so sánh ngày dễ dàng

export const GET = async (req) => {
  try {
    await connectToDB();

    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    const hocKy = searchParams.get('hocKy');

    let filter = {};

    if (namHoc) {
      filter.namHoc = namHoc;
    }
    // Chỉ thêm 'hocKy' nếu nó có giá trị và không phải là 'null' hoặc 'undefined'
    if (hocKy && hocKy !== 'null' && hocKy !== 'undefined') {
      url.searchParams.append('hocKy', hocKy);
    }

    // Lấy danh sách phân công coi thi
    const soPhanCongPcChamThi = await PcChamThi.find(filter);

    // Ngày hiện tại
    const today = dayjs();

    // Đếm số lượng phân công đã hoàn thành (ngày thi đã qua)
    let completedCount = 0;

    soPhanCongPcChamThi.forEach((assignment) => {
      const ngayThi = dayjs(assignment.ngayThi);
      if (ngayThi.isBefore(today, 'day')) {
        completedCount++;
      }
    });

    // Tính phần trăm hoàn thành
    const totalAssignments = soPhanCongPcChamThi.length;
    const completionPercentage = totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0;

    // Tạo kết quả để trả về
    const result = {
      totalAssignments,
      completedCount,
      completionPercentage: completionPercentage.toFixed(1) // Giới hạn đến 2 chữ số thập phân
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("Lỗi khi lấy thống kê chấm thi:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
