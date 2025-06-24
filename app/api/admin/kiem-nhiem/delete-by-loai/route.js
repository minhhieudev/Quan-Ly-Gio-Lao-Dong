import { connectToDB } from "@mongodb";
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import ChucVu from "@models/ChucVu";

export const DELETE = async (req) => {
  try {
    await connectToDB();
    
    const { loaiChucVu, schoolYearStart, schoolYearEnd } = await req.json();
    
    if (!loaiChucVu) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Loại chức vụ là bắt buộc" 
      }), { status: 400 });
    }
    
    // Tìm tất cả chức vụ thuộc loại đã chọn
    const chucVuList = await ChucVu.find({ loaiCV: loaiChucVu }).select('_id');
    const chucVuIds = chucVuList.map(cv => cv._id);
    
    if (chucVuIds.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Không tìm thấy chức vụ nào thuộc loại này" 
      }), { status: 404 });
    }
    
    // Xây dựng query để xóa
    let query = {
      chucVu: { $in: chucVuIds }
    };
    
    // Thêm điều kiện năm học nếu có
    if (schoolYearStart && schoolYearEnd) {
      query.schoolYearStart = new Date(schoolYearStart);
      query.schoolYearEnd = new Date(schoolYearEnd);
    }
    
    // Xóa các record phù hợp
    const result = await PhanCongKiemNhiem.deleteMany(query);
    
    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `Đã xóa ${result.deletedCount} bản ghi thành công`
    }), { status: 200 });
    
  } catch (err) {
    console.error("Error deleting records by loai chuc vu:", err);
    return new Response(JSON.stringify({
      success: false,
      message: "Lỗi khi xóa dữ liệu: " + err.message
    }), { status: 500 });
  }
};