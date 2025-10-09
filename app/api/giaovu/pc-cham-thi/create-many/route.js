import { connectToDB } from '@mongodb';
import CongTacChamThi from '@models/CongTacChamThi';

export const POST = async (req) => {
  try {
    await connectToDB();

    const { data } = await req.json();
    console.log(data);


    if (!Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({ message: "Dữ liệu không hợp lệ" }), 
        { status: 400 }
      );
    }

    const processedResults = [];

    // Xử lý từng bản ghi
    for (const item of data) {
      // Tìm bản ghi tương ứng
      const existingRecord = await CongTacChamThi.findOne({
        namHoc: item.namHoc,
        ky: item.ky,
        hocPhan: item.hocPhan,
        lopHocPhan: item.lopHocPhan,
        user: item.user,

      });

      const currentTime = new Date();
      
      if (existingRecord) {
        // Nếu tồn tại thì update
        const updatedRecord = await CongTacChamThi.findByIdAndUpdate(
          existingRecord._id,
          {
            hocPhan: item.hocPhan,
            lopHocPhan: item.lopHocPhan,
            canBoChamThi: item.canBoChamThi,
            soBaiCham: item.soBaiCham,
            soTietQuyChuan: item.soTietQuyChuan,
            hinhThuc: item.hinhThuc,
            thoiGian: item.thoiGian,
            namHoc: item.namHoc,
            ky: item.ky,
            ghiChu: item.ghiChu,
            type: item.type,
            updatedAt: currentTime
          },
          { new: true }
        );
        processedResults.push(updatedRecord);
      } else {
        // Nếu chưa tồn tại thì tạo mới
        const newRecord = await CongTacChamThi.create({
          hocPhan: item.hocPhan,
          lopHocPhan: item.lopHocPhan,
          canBoChamThi: item.canBoChamThi,
          soBaiCham: item.soBaiCham,
          soTietQuyChuan: item.soTietQuyChuan,
          hinhThuc: item.hinhThuc,
          thoiGian: item.thoiGian,
          namHoc: item.namHoc,
          ky: item.ky,
          ghiChu: item.ghiChu,
          type: item.type,
          user: item.user,
          createdAt: currentTime,
          updatedAt: currentTime
        });
        processedResults.push(newRecord);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Xử lý thành công", 
        count: processedResults.length,
        data: processedResults
      }), 
      { status: 201 }
    );

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(
      JSON.stringify({ 
        message: "Có lỗi xảy ra khi xử lý dữ liệu",
        error: err.message 
      }), 
      { status: 500 }
    );
  }
};
