import { connectToDB } from "@mongodb";
import TongHopLaoDong from "@models/TongHopLaoDong";
import BoiDuong from "@models/BoiDuong";

export const DELETE = async (req) => {
  try {
    await connectToDB();
    
    const { namHoc, loai } = await req.json();
    
    if (!namHoc) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Năm học là bắt buộc" 
      }), { status: 400 });
    }
    
    let result;
    
    // Chọn model dựa trên loại
    if (loai === 'boi-duong') {
      result = await BoiDuong.deleteMany({ namHoc });
    } else {
      result = await TongHopLaoDong.deleteMany({ 
        namHoc,
        loai
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Đã xóa ${result.deletedCount} bản ghi thành công`,
      deletedCount: result.deletedCount
    }), { status: 200 });
    
  } catch (err) {
    console.error("Error deleting records:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Lỗi khi xóa dữ liệu: ${err.message}` 
    }), { status: 500 });
  }
};