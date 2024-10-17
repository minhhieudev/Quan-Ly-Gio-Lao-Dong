import { connectToDB } from '@mongodb';
import PcCoiThi from "@models/PcCoiThi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

// Kích hoạt các plugin
dayjs.extend(customParseFormat);
dayjs.extend(utc);

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
    const soPhanCongCoiThi = await PcCoiThi.find(filter);

    // Ngày hiện tại, đặt về UTC và đầu ngày
    const today = dayjs().utc().startOf('day');

    // Đếm số lượng phân công đã hoàn thành (ngày thi đã qua)
    let completedCount = 0;

    soPhanCongCoiThi.forEach((assignment) => {
      if (!assignment.ngayThi) {
        console.warn(`Assignment ID: ${assignment._id} không có ngayThi.`);
        return;
      }

      // Phân tích cú pháp ngayThi theo định dạng và chuyển sang UTC
      const ngayThi = dayjs(assignment.ngayThi, 'DD/MM/YYYY').utc().startOf('day');

      if (!ngayThi.isValid()) {
        console.warn(`Assignment ID: ${assignment._id} có ngayThi không hợp lệ: ${assignment.ngayThi}`);
        return;
      }

      const isCompleted = ngayThi.isBefore(today);
      if (isCompleted) {
        completedCount++;
      }
    });

    console.log('Filter:', filter);

    // Tính phần trăm hoàn thành
    const totalAssignments = soPhanCongCoiThi.length;
    const completionPercentage = totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0;

    // Tạo kết quả để trả về
    const result = {
      totalAssignments,
      completedCount,
      completionPercentage: completionPercentage.toFixed(1) // Giới hạn đến 2 chữ số thập phân
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("Lỗi khi lấy thống kê coi thi:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
