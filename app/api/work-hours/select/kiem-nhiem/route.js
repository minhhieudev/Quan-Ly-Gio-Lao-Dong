export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import ChucVu from "@models/ChucVu";
import Khoa from "@models/Khoa"; // Thêm dòng này nếu chưa có

export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');

    const data = await PhanCongKiemNhiem.find({ user })
      .populate('user', 'username maKhoa') // Lấy maKhoa thay vì khoa
      .populate('chucVu');

    // Gán tên khoa từ bảng Khoa vào user
    const dataWithKhoa = await Promise.all(data.map(async (item) => {
      const obj = item.toObject();
      if (obj.user && obj.user.maKhoa) {
        const khoaDoc = await Khoa.findOne({ maKhoa: obj.user.maKhoa });
        obj.user.khoa = khoaDoc ? khoaDoc.tenKhoa : null;
      } else {
        obj.user.khoa = null;
      }
      return obj;
    }));

    return new Response(JSON.stringify(dataWithKhoa), { status: 200 });
  } catch (err) {
    console.error("Error fetching PhanCongKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

