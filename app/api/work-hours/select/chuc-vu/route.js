export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import ChucVu from "@models/ChucVu";


export const GET = async (req) => {
  try {
    await connectToDB();

    const data = await ChucVu.find()

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error fetching ChucVu:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

