export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HocPhan from '@models/HocPhan';

export const GET = async (req) => {
  try {
    await connectToDB();

    // Parse URL to get the `maMH` query parameter
    const url = new URL(req.url);
    const maMH = url.searchParams.get('maMH');

    if (!maMH) {
      return new Response(JSON.stringify({ message: "maMH is required" }), { status: 400 });
    }

    // Find the document by `maMH`
    const hocPhan = await HocPhan.findOne({ maMH });

    if (!hocPhan) {
      return new Response(JSON.stringify({ message: "HocPhan not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(hocPhan), { status: 200 });
  } catch (err) {
    console.error("Lỗi :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
