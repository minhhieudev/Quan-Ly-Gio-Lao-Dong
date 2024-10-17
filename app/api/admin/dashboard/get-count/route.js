import { connectToDB } from '@mongodb';
import PcChamThi from "@models/PcChamThi";
import PcCoiThi from "@models/PcCoiThi";
import User from "@models/User";
import dayjs from "dayjs";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    const hocKy = searchParams.get('hocKy');
    const khoa = searchParams.get('khoa');

    console.log('Khoa:', khoa)

    let filter = {};

    if (namHoc) {
      filter.namHoc = namHoc;
    }
    // Chỉ thêm 'hocKy' nếu nó có giá trị và không phải là 'null' hoặc 'undefined'
    if (hocKy && hocKy !== 'null' && hocKy !== 'undefined') {
      url.searchParams.append('hocKy', hocKy);
    }

    let giangViens = [];

    if (khoa) {
      giangViens = await User.find({ khoa });
    } else {
      giangViens = await User.find(); // Nếu không có khoa, lấy tất cả giảng viên
    }

    // Tạo một đối tượng để lưu trữ kết quả
    const result = giangViens.map(giangVien => ({
      username: giangVien.username,
      khoa: giangVien.khoa,
      soBuoiChamThi: 0,
      soBuoiCoiThi: 0,
    }));

    // Lấy danh sách phân công chấm thi phù hợp với filter
    const phanCongChamThi = await PcChamThi.find(filter).select('cb1 cb2');

    // Lấy danh sách phân công cói thi phù hợp với filter
    const phanCongCoiThi = await PcCoiThi.find(filter).select('cbo1 cbo2');

    console.log('11111111:', filter)

    //Đếm số buổi chấm thi cho mỗi giảng viên
    phanCongChamThi.forEach(pc => {
      [pc.cb1, pc.cb2].forEach(cb => {
        if (cb) {
          const giangVien = result.find(gv => gv.username == cb);
          if (giangVien) {
            giangVien.soBuoiChamThi += 1;
          }
        }
      });
    });

    // Đếm số buổi cói thi cho mỗi giảng viên
    phanCongCoiThi.forEach(pc => {
      [pc.cbo1, pc.cbo2].forEach(cb => {
        if (cb) {
          const giangVien = result.find(gv => gv.username == cb);
          if (giangVien) {
            giangVien.soBuoiCoiThi += 1;
          }
        }
      });
    });

    return new Response(JSON.stringify(result), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi lấy thống kê :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
