export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcGiangDay from '@models/PcGiangDay';

// Hàm lấy dữ liệu dựa trên id từ param
export const GET = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Tìm kiếm thông tin PcGiangDay theo id
    const pcGiangDay = await PcGiangDay.findById(id);

    if (!pcGiangDay) {
      return new Response("Không tìm thấy thông tin phân công giảng dạy", { status: 404 });
    }

    // Trả về phản hồi thành công với dữ liệu PcGiangDay
    return new Response(JSON.stringify(pcGiangDay), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error fetching PcGiangDay:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
