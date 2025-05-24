import PhanCongKiemNhiemBackup from "@models/PhanCongKiemNhiemBackup";
import { connectToDB } from "@mongodb";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Extract query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize")) || 10;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build query conditions
    let query = {};
    if (startDate && endDate) {
      query.transferredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.transferredAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transferredAt = { $lte: new Date(endDate) };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get data with search conditions and pagination
    const data = await PhanCongKiemNhiemBackup.find(query)
      .populate('chucVu', 'tenCV loaiCV') // Populate chucVu field
      .populate('user', 'username khoa') // Populate user field
      .sort({ transferredAt: -1 }) // Sort by transfer date, newest first
      .skip(skip)
      .limit(pageSize);

    // Get total count for pagination
    const total = await PhanCongKiemNhiemBackup.countDocuments(query);

    return new Response(JSON.stringify({ data, total }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to get PhanCongKiemNhiemBackup data", { status: 500 });
  }
};

// DELETE (Delete backup record)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Find and delete the backup record
    const deletedRecord = await PhanCongKiemNhiemBackup.findByIdAndDelete(id);

    if (!deletedRecord) {
      return new Response("Backup record not found", { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete backup record", { status: 500 });
  }
};

// Bulk delete by date range
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { startDate, endDate } = await req.json();

    let query = {};
    if (startDate && endDate) {
      query.transferredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.transferredAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transferredAt = { $lte: new Date(endDate) };
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Cần chỉ định ít nhất một khoảng thời gian để xóa"
      }), { status: 400 });
    }

    const result = await PhanCongKiemNhiemBackup.deleteMany(query);

    return new Response(JSON.stringify({
      success: true,
      deletedCount: result.deletedCount,
      message: `Đã xóa ${result.deletedCount} bản ghi thành công`
    }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to bulk delete backup records", { status: 500 });
  }
};
