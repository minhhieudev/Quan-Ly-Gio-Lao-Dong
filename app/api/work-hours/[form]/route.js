export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import CongTacGiangDay from "@models/CongTacGiangDay";
import BoiDuong from "@models/BoiDuong";
import CongTacChamThi from "@models/CongTacChamThi";
import CongTacCoiThi from "@models/CongTacCoiThi";
import CongTacHuongDan from "@models/CongTacHuongDan";
import CongTacKiemNhiem from "@models/CongTacKiemNhiem";
import CongTacRaDe from "@models/CongTacRaDe";
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import MaNgach from "@models/MaNgach";

import User from "@models/User";
import ChucVu from "@models/ChucVu";

const models = {
  CongTacGiangDay,
  BoiDuong,
  CongTacChamThi,
  CongTacCoiThi,
  CongTacHuongDan,
  CongTacKiemNhiem,
  CongTacRaDe,
};

export const POST = async (req, { params }) => {
  try {
    const { form } = params;


    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const body = await req.json();

    const model = models[form];

    // Kiểm tra xem bản ghi đã tồn tại chưa
    const { hocPhan, namHoc, user, ky, ngayThi } = body;

    // Tạo query để kiểm tra trùng lặp
    let duplicateQuery = { hocPhan, namHoc, user, ky };

    // Đối với CongTacCoiThi, thêm ngayThi vào query để tránh trùng lặp
    if (form === 'CongTacCoiThi' && ngayThi) {
      duplicateQuery.ngayThi = ngayThi;
    }

    const existingRecord = await model.findOne(duplicateQuery);

    if (existingRecord) {
      // Nếu bản ghi đã tồn tại, trả về bản ghi hiện tại thay vì tạo mới
      return new Response(JSON.stringify({
        ...existingRecord.toObject(),
        message: 'Bản ghi đã tồn tại, không tạo mới'
      }), { status: 200 });
    } else {
      // Nếu không tồn tại, tạo bản ghi mới
      const newRecord = await model.create(body);
      return new Response(JSON.stringify(newRecord), { status: 200 });
    }
  } catch (err) {
    console.log('POST Error:', err);
    const { form } = params;
    return new Response(`Failed to create or update ${form || 'unknown'} record: ${err.message}`, { status: 500 });
  }
};

export const PUT = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const body = await req.json();


    const { id, ...updateData } = body;
    const model = models[form];
    const updatedRecord = await model.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(updatedRecord), { status: 200 });
  } catch (err) {
    console.log('PUT Error:', err);
    const { form } = params;
    return new Response(`Failed to update ${form || 'unknown'} record: ${err.message}`, { status: 500 });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const { id } = await req.json();
    const model = models[form];


    await model.findByIdAndDelete(id);
    return new Response(`${form} record deleted successfully`, { status: 200 });
  } catch (err) {
    console.log('DELETE Error:', err);
    const { form } = params;
    return new Response(`Failed to delete ${form || 'unknown'} record: ${err.message}`, { status: 500 });
  }
};

export const GET = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');
    const type1 = url.searchParams.get('type');
    const namHoc = url.searchParams.get('namHoc');
    const ky = url.searchParams.get('ky');
    let type = ''

    //  await PhanCongKiemNhiem.updateMany(
    //   {}, // Không có điều kiện - cập nhật tất cả
    //   { 
    //     $set: { 
    //       schoolYearStart: new Date('2025-10-01'), 
    //       schoolYearEnd: new Date('2026-05-31') 
    //     } 
    //   }
    // );

    if (!user) {
      return new Response("User and type parameters are required", { status: 400 });
    }

    const query = {
      user,
      type
    };

    if (namHoc) {
      query.namHoc = namHoc;
    }

    if (ky) {
      query.ky = ky;
    }

    if (type1) {
      query.type = type1;
    }
    const records = await models[form].find(query).populate('user', 'username');

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve ${form} records`, { status: 500 });
  }
};

