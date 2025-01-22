export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";


export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');

    const data = await PhanCongKiemNhiem.find({ user })
      .populate('chucVu')
      .populate('user', 'username khoa');


    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error fetching PhanCongKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

