export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import PcCoiThi from "@models/PcCoiThi";

// GET - Lấy danh sách phân công coi thi
export const GET = async (req) => {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    let namHoc = searchParams.get('namHoc');
    let ky = searchParams.get('ky');
    let type = searchParams.get('type');
    let loaiKyThi = searchParams.get('loaiKyThi');
    let userName = searchParams.get('userName'); // Tên user để tìm trong cbo1/cbo2

    // Normalize: nếu là 'undefined' hoặc rỗng thì set về undefined
    if (namHoc === '' || namHoc === 'undefined') namHoc = undefined;
    if (ky === '' || ky === 'undefined') ky = undefined;
    if (type === '' || type === 'undefined') type = undefined;
    if (loaiKyThi === '' || loaiKyThi === 'undefined') loaiKyThi = undefined;
    if (userName === '' || userName === 'undefined') userName = undefined;

    let query = {};
    if (namHoc !== null && namHoc !== undefined && namHoc !== '' && namHoc !== 'undefined') query.namHoc = namHoc;
    if (ky !== null && ky !== undefined && ky !== '' && ky !== 'undefined') query.ky = ky;
    if (type !== null && type !== undefined && type !== '' && type !== 'undefined') query.type = type;
    if (loaiKyThi !== null && loaiKyThi !== undefined && loaiKyThi !== '' && loaiKyThi !== 'undefined') query.loaiKyThi = loaiKyThi;

    // Tìm theo user trong cbo1 hoặc cbo2
    if (userName) {
      query.$or = [
        { cbo1: { $elemMatch: { $regex: userName, $options: 'i' } } },
        { cbo2: { $elemMatch: { $regex: userName, $options: 'i' } } }
      ];
    }

    // Chỉ log các filter thực sự có giá trị
    const logFilters = {};
    if (namHoc !== undefined && namHoc !== null) logFilters.namHoc = namHoc;
    if (ky !== undefined && ky !== null) logFilters.ky = ky;
    if (type !== undefined && type !== null) logFilters.type = type;
    if (loaiKyThi !== undefined && loaiKyThi !== null) logFilters.loaiKyThi = loaiKyThi;
    if (userName !== undefined && userName !== null) logFilters.userName = userName;

    const pcCoiThiList = await PcCoiThi.find(query)
      //.populate('user', 'name email')
      .sort({ ngayThi: 1, tenHocPhan: 1 });

    return new Response(JSON.stringify(pcCoiThiList), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('GET PcCoiThi Error:', err);
    return new Response(`Failed to fetch PcCoiThi records: ${err.message}`, { status: 500 });
  }
};

// POST - Tạo mới phân công coi thi
export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();

    // Kiểm tra trùng lặp
    const { hocPhan, ngayThi, namHoc, ky } = body;
    const existingRecord = await PcCoiThi.findOne({
      hocPhan,
      ngayThi,
      namHoc,
      ky
    });

    if (existingRecord) {
      return new Response(JSON.stringify({
        ...existingRecord.toObject(),
        message: 'Bản ghi đã tồn tại'
      }), { status: 200 });
    }

    const newRecord = await PcCoiThi.create(body);
    return new Response(JSON.stringify(newRecord), { status: 201 });

  } catch (err) {
    console.error('POST PcCoiThi Error:', err);
    return new Response(`Failed to create PcCoiThi record: ${err.message}`, { status: 500 });
  }
};

// PUT - Cập nhật phân công coi thi
export const PUT = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    const updatedRecord = await PcCoiThi.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });

    if (!updatedRecord) {
      return new Response("Record not found", { status: 404 });
    }

    return new Response(JSON.stringify(updatedRecord), { status: 200 });

  } catch (err) {
    console.error('PUT PcCoiThi Error:', err);
    return new Response(`Failed to update PcCoiThi record: ${err.message}`, { status: 500 });
  }
};

// DELETE - Xóa phân công coi thi
export const DELETE = async (req) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    const deletedRecord = await PcCoiThi.findByIdAndDelete(id);

    if (!deletedRecord) {
      return new Response("Record not found", { status: 404 });
    }

    return new Response("PcCoiThi record deleted successfully", { status: 200 });

  } catch (err) {
    console.error('DELETE PcCoiThi Error:', err);
    return new Response(`Failed to delete PcCoiThi record: ${err.message}`, { status: 500 });
  }
};
