export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HocPhan from "@models/HocPhan";

export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name');

    const data = await HocPhan.find({ 
      tenMH: { $regex: new RegExp(name, 'i') }
    });
     
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Lỗi lưu học phần mới:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
