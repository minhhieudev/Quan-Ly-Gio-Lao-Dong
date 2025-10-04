// DELETE: Xóa 1 bản ghi công tác kiêm nhiệm theo _id
export const DELETE = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return new Response('Thiếu id để xóa', { status: 400 });
    }
    const deleted = await CongTacKiemNhiem.findByIdAndDelete(id);
    if (!deleted) {
      return new Response('Không tìm thấy bản ghi để xóa', { status: 404 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error deleting CongTacKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import CongTacKiemNhiem from "@models/CongTacKiemNhiem";
import ChucVu from "@models/ChucVu";
import Khoa from "@models/Khoa"; // Thêm dòng này nếu chưa có


export const GET = async (req) => {
  try {
    await connectToDB();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');
    const type = url.searchParams.get('type');
    const namHoc = url.searchParams.get('namHoc');

    // Xây dựng filter động
    const filter = {};
    if (user) filter.user = user;
    if (type) filter.type = type;
    if (namHoc) filter.namHoc = namHoc;

    const data = await CongTacKiemNhiem.find(filter)
      .populate('user', 'username maKhoa')
    const dataWithKhoa = await Promise.all(data.map(async (item) => {
      const obj = item.toObject();
      if (obj.user && obj.user.maKhoa) {
        const khoaDoc = await Khoa.findOne({ maKhoa: obj.user.maKhoa });
        obj.user.khoa = khoaDoc ? khoaDoc.tenKhoa : null;
      } else {
        obj.user.khoa = null;
      }
      return obj;
    }));
    return new Response(JSON.stringify(dataWithKhoa), { status: 200 });
  } catch (err) {
    console.error("Error fetching PhanCongKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

// Thêm mới list công tác kiêm nhiệm (POST)

// POST: Nhận 1 list data, nếu trùng thì update, không tạo mới
export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { list } = body;
    if (!Array.isArray(list) || list.length === 0) {
      return new Response('Thiếu dữ liệu list', { status: 400 });
    }

    const results = [];
    for (const item of list) {
      if (
        !item.user ||
        !item.chucVuCongViec ||
        !item.namHoc ||
        !item.type ||
        !item.thoiGianTinh
      ) continue;

      // Chuẩn hóa thoiGianTinh
      const thoiGianTinh = item.thoiGianTinh.trim().replace(/\s+/g, ' ');

      const filter = {
        user: typeof item.user === 'object' ? item.user._id : item.user,
        chucVuCongViec: item.chucVuCongViec,
        namHoc: item.namHoc,
        type: item.type,
        thoiGianTinh: thoiGianTinh
      };

      const existing = await CongTacKiemNhiem.findOne(filter);
      if (existing) {
        const updated = await CongTacKiemNhiem.findOneAndUpdate(
          filter,
          { $set: { ...item, thoiGianTinh } },
          { new: true }
        );
        results.push(updated);
      } else {
        const created = await CongTacKiemNhiem.create({ ...item, thoiGianTinh });
        results.push(created);
      }
    }
    return new Response(JSON.stringify(results), { status: 201 });
  } catch (err) {
    console.error("Error creating/updating CongTacKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

// PATCH: Update 1 bản ghi công tác kiêm nhiệm theo _id
export const PATCH = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) {
      return new Response('Thiếu _id để update', { status: 400 });
    }
    const updated = await CongTacKiemNhiem.findByIdAndUpdate(_id, { $set: updateData }, { new: true });
    if (!updated) {
      return new Response('Không tìm thấy bản ghi để update', { status: 404 });
    }
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error("Error updating CongTacKiemNhiem:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

