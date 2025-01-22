export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import ChucVu from "@models/ChucVu";

export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');

    const data = await PhanCongKiemNhiem.find({ user })
      .populate('user', 'username khoa')
      .populate('chucVu');


    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error fetching PhanCongKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

