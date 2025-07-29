export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import PcCoiThi from "@models/PcCoiThi";

// GET - Lấy danh sách phân công coi thi
export const GET = async (req) => {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    const ky = searchParams.get('ky');
    const type = searchParams.get('type');
    const user = searchParams.get('user');

    let query = {};
    if (namHoc) query.namHoc = namHoc;
    if (ky) query.ky = ky;
    if (type) query.type = type;
    if (user) query.user = user;

    const pcCoiThiList = await PcCoiThi.find(query)
      .populate('user', 'name email')
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
    const { hocPhan, ngayThi, user, namHoc, ky } = body;
    const existingRecord = await PcCoiThi.findOne({
      hocPhan,
      ngayThi,
      user,
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
