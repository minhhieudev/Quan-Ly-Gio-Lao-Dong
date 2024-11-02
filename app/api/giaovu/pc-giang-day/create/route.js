import { connectToDB } from '@mongodb';
import PcGiangDay from "@models/PcGiangDay";

export const POST = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu từ body của yêu cầu
    const { data, loai } = await req.json();

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    // Duyệt qua danh sách và xử lý từng phần tử
    const processedItems = await Promise.all(
      data.map(async (item) => {
        const maMH = item[0]; 
        const tenMH = item[1];
        const soTC = item[2];
        const soSVDK = item[3];
        const gvGiangDay = item[4];
        const nhom = item[5];
        const thu = item[6];
        const tietBD = item[7];
        const soTiet = item[8];
        const phong = item[9];
        const lop = item[10];
        const tuanHoc = item[11];
        const namHoc = item[12]; 
        const ky = item[13]; 
        const diaDiem = item[14] ==''? 'DHPY':item[14]; 

        // Tìm và cập nhật nếu tồn tại, nếu không thì tạo mới
        const updatedItem = await PcGiangDay.findOneAndUpdate(
          { maMH, namHoc, ky, thu, tietBD, phong }, 
          {
            tenMH,
            soTC,
            soSVDK,
            gvGiangDay,
            nhom,
            soTiet,
            lop,
            tuanHoc,
            loai,
            diaDiem
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
