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
    const backupRecords = await Promise.all(
      recordsToTransfer.map(async (record) => {
        // Tạo bản ghi backup mới
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
        return backupRecord;
      })
    );
    
    // Lấy danh sách ID của các bản ghi đã chuyển để xóa
    const recordIds = recordsToTransfer.map(record => record._id);
    
    // Xóa tất cả bản ghi khỏi bảng PhanCongKiemNhiem
    const deleteResult = await PhanCongKiemNhiem.deleteMany({});

    // Trả về kết quả
    return new Response(JSON.stringify({
      success: true,
      message: `Đã chuyển ${backupRecords.length} bản ghi thành công vào bảng lưu trữ và xóa khỏi bảng gốc`,
      count: backupRecords.length,
      deletedCount: deleteResult.deletedCount
    }), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi chuyển dữ liệu:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Đã xảy ra lỗi khi chuyển dữ liệu" 
    }), { status: 500 });
  }
};
