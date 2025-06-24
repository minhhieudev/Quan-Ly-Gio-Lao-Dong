export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import LoaiChucVu from "@models/LoaiChucVu";

export const GET = async (req) => {
  try {
    await connectToDB();

    const data = await LoaiChucVu.find();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error fetching LoaiChucVu:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};