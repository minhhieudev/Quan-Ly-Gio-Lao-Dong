import { connectToDB } from '@mongodb';
import HocPhan from '@models/HocPhan';

export const POST = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu từ body của yêu cầu
    const { data } = await req.json();
    console.log(data)

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    const processedItems = await Promise.all(
      data.map(async (item) => {
        const { 
          maMH,
          tenMH, 
          soTC, 
          soTietLT, 
          soTietTH, 
          trinhDo, 
          soLuong, 
          heSo, 
          ghiChu
        } = item;

        // Tìm và cập nhật nếu tồn tại, nếu không thì tạo mới
        const updatedItem = await HocPhan.findOneAndUpdate(
          { maMH }, 
          {
            $set: {
              tenMH,
              soTietLT, 
              soTietTH, 
              soTC,
              trinhDo, 
              soLuong, 
              heSo, 
              ghiChu
            }
          }, 
          { new: true, upsert: true } 
        );

        return updatedItem; 
      })
    );

    return new Response(JSON.stringify(processedItems), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process" }), { status: 500 });
  }
};
