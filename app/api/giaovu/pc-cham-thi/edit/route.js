export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcChamThiModel from '@models/PcChamThi';

// Hàm lấy dữ liệu dựa trên id từ param
export const GET = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Tìm kiếm thông tin PcChamThi theo id
    const PcChamThi = await PcChamThiModel.findById(id);

    if (!PcChamThi) {
      return new Response("Không tìm thấy thông tin phân công coi thi", { status: 404 });
    }

    // Trả về phản hồi thành công với dữ liệu PcChamThi
    return new Response(JSON.stringify(PcChamThi), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error fetching PcChamThi:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
