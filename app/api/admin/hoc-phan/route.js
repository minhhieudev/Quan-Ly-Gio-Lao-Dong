export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import HocPhan from '@models/HocPhan';

export const GET = async (req) => {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
    const searchTerm = url.searchParams.get('search') || '';
    const khoa = url.searchParams.get('khoa') || '';

    // Xây dựng query
    let query = {};
    
    // Thêm điều kiện tìm kiếm
    if (searchTerm) {
      query = {
        $or: [
          { maMH: { $regex: searchTerm, $options: 'i' } },
          { tenMH: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    // Thêm điều kiện lọc theo khoa
    if (khoa) {
      query.khoa = khoa;
    }

    const assignments = await HocPhan.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await HocPhan.countDocuments(query);

    return new Response(JSON.stringify({ assignments, total }), { status: 200 });
  } catch (err) {
    console.error("Lỗi :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    await connectToDB();

    const data = await req.json();
    const { maHP } = data;

    let assignment;

    if (maHP) {
      assignment = await HocPhan.findOneAndUpdate({ maHP }, data, { new: true, upsert: true });
    } else {
      assignment = new HocPhan(data);
      await assignment.save();
    }

    return new Response(JSON.stringify(assignment), { status: 201 });
  } catch (err) {
    console.error("Lỗi :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { id, ...data } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "ID bản ghi không được cung cấp." }), { status: 400 });
    }

    const updatedAssignment = await HocPhan.findByIdAndUpdate(id, data, { new: true });

    if (!updatedAssignment) {
      return new Response(JSON.stringify({ message: "Không tìm thấy bản ghi để cập nhật." }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedAssignment), { status: 200 });
  } catch (err) {
    console.error("Lỗi :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    await connectToDB();

    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "ID bản ghi không được cung cấp." }), { status: 400 });
    }

    const deletedAssignment = await HocPhan.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return new Response(JSON.stringify({ message: "Không tìm thấy bản ghi để xóa." }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Bản ghi đã được xóa thành công." }), { status: 200 });
  } catch (err) {
    console.error("Lỗi :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};