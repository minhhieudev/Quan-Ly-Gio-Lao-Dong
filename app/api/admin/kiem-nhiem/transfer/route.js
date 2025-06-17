import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import PhanCongKiemNhiemBackup from "@models/PhanCongKiemNhiemBackup";
import { connectToDB } from "@mongodb";

export const POST = async (req) => {
  try {
    await connectToDB();

    // Lấy tất cả bản ghi từ bảng PhanCongKiemNhiem
    const recordsToTransfer = await PhanCongKiemNhiem.find({}).populate('user').populate('chucVu');

    if (recordsToTransfer.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Không có dữ liệu nào trong bảng phân công kiêm nhiệm" 
      }), { status: 404 });
    }

    // Chuyển tất cả dữ liệu sang bảng backup
    const backupResults = await Promise.all(
      recordsToTransfer.map(async (record) => {
        // Kiểm tra xem bản ghi đã tồn tại trong bảng backup chưa
        const existingBackup = await PhanCongKiemNhiemBackup.findOne({
          chucVu: record.chucVu._id,
          user: record.user._id,
          schoolYearStart: record.schoolYearStart,
          schoolYearEnd: record.schoolYearEnd
        });

        if (existingBackup) {
          // Nếu đã tồn tại, cập nhật bản ghi
          existingBackup.startTime = record.startTime;
          existingBackup.endTime = record.endTime;
          existingBackup.ghiChu = record.ghiChu;
          existingBackup.transferredAt = new Date();
          await existingBackup.save();
          return { updated: true, record: existingBackup };
        } else {
          // Nếu chưa tồn tại, tạo bản ghi mới
          const backupRecord = new PhanCongKiemNhiemBackup({
            chucVu: record.chucVu._id,
            startTime: record.startTime,
            endTime: record.endTime,
            ghiChu: record.ghiChu,
            user: record.user._id,
            schoolYearStart: record.schoolYearStart,
            schoolYearEnd: record.schoolYearEnd,
            transferredAt: new Date()
          });
          await backupRecord.save();
          return { updated: false, record: backupRecord };
        }
      })
    );
    
    // Tính toán số lượng bản ghi đã cập nhật và tạo mới
    const updatedCount = backupResults.filter(result => result.updated).length;
    const newCount = backupResults.filter(result => !result.updated).length;

    
    // Xóa tất cả bản ghi khỏi bảng PhanCongKiemNhiem
    //await PhanCongKiemNhiem.deleteMany({});

    // Trả về kết quả
    return new Response(JSON.stringify({
      success: true,
      message: `Đã chuyển ${backupResults.length} bản ghi thành công vào bảng lưu trữ (${newCount} bản ghi mới, ${updatedCount} bản ghi cập nhật)`,
      count: backupResults.length,
      updatedCount,
      newCount
    }), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi chuyển dữ liệu:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Đã xảy ra lỗi khi chuyển dữ liệu" 
    }), { status: 500 });
  }
};

