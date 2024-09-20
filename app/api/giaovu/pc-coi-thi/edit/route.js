export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcCoiThiModel from '@models/PcCoiThi';

// Hàm lấy dữ liệu dựa trên id từ param
export const GET = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Tìm kiếm thông tin PcCoiThi theo id
    const PcCoiThi = await PcCoiThiModel.findById(id);

    if (!PcCoiThi) {
      return new Response("Không tìm thấy thông tin phân công coi thi", { status: 404 });
    }

    // Trả về phản hồi thành công với dữ liệu PcCoiThi
    return new Response(JSON.stringify(PcCoiThi), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error fetching PcCoiThi:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
