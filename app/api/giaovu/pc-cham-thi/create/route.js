import { connectToDB } from '@mongodb';
import PcChamThi from '@models/PcChamThi';

export const POST = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu từ body của yêu cầu
    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    // Duyệt qua danh sách và xử lý từng phần tử
    const processedItems = await Promise.all(
      data.map(async (item) => {
        const { 
          cb1, 
          cb2, 
          hocPhan, 
          loaiKyThi, 
          ky,
          namHoc, 
          ngayThi, 
          nhomLop, 
          loai,
          soBai,
          hinhThuc,
          thoiGian
        } = item;

        
        const updatedItem = await PcChamThi.findOneAndUpdate(
          { namHoc, loaiKyThi, ngayThi, hocPhan,nhomLop }, 
          {
            $set: {
              soBai,
              cb1,
              cb2,
              hinhThuc,
              thoiGian,
              loai,
              ky
            }
          }, 
          { new: true, upsert: true } // Nếu không tìm thấy thì tạo mới
        );

        return updatedItem; 
      })
    );

    // Trả về danh sách đã xử lý
    return new Response(JSON.stringify(processedItems), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process" }), { status: 500 });
  }
};
