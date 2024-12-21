export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HocPhan from '@models/HocPhan';

// Hàm lấy dữ liệu dựa trên id từ param
export const GET = async (req) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const hocphan = await HocPhan.findById(id);

    if (!hocphan) {
      return new Response("Không tìm thấy thông tin phân công giảng dạy", { status: 404 });
    }

    return new Response(JSON.stringify(hocphan), { status: 200 });
  } catch (err) {
    console.error("Error fetching hocphan:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
