export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HocPhan from "@models/HocPhan";

export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name');
    const maHP = url.searchParams.get('maHP');

    let query = {};

    // Tìm kiếm theo mã học phần (ưu tiên)
    if (maHP) {
      query = {
        maMH: { $regex: new RegExp(maHP, 'i') }
      };
    }
    // Tìm kiếm theo tên học phần (fallback)
    else if (name) {
      query = {
        tenMH: { $regex: new RegExp(name, 'i') }
      };
    }

    const data = await HocPhan.find(query);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Lỗi lấy dữ liệu học phần:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
