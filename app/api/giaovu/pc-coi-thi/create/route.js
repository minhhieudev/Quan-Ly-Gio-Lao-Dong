import { connectToDB } from '@mongodb';
import PcCoiThi from '@models/PcCoiThi';

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
          ca, 
          cb1, 
          cb2, 
          diaDiem, 
          ghiChu, 
          hocPhan, 
          loaiKyThi, 
          namHoc, 
          ngayThi, 
          nhomLop, 
          phongThi, 
          time ,
          loai
        } = item;

        // Chuyển đổi các giá trị từ mảng thành chuỗi nếu cần
        const hocPhanArray = Array.isArray(hocPhan) ? hocPhan : [hocPhan];
        const nhomLopArray = Array.isArray(nhomLop) ? nhomLop : [nhomLop];
        const timeArray = Array.isArray(time) ? time : [time];

        // Tìm và cập nhật nếu tồn tại, nếu không thì tạo mới
        const updatedItem = await PcCoiThi.findOneAndUpdate(
          { namHoc, loaiKyThi, ngayThi, phongThi,hocPhan,nhomLop }, 
          {
            $set: {
              ca,
              cb1,
              cb2,
              diaDiem,
              ghiChu,
              phongThi,
              time: timeArray,
              loai
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
