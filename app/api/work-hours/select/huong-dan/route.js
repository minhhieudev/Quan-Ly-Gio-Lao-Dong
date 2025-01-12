export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HuongDan from "@models/HuongDan";


export const GET = async (req) => {
  try {
    await connectToDB();

    const data = await HuongDan.find();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error fetching HuongDan:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

