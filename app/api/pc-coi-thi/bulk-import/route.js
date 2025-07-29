export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import PcCoiThi from "@models/PcCoiThi";

export const POST = async (req) => {
  try {
    await connectToDB();
    const { items, type, user, namHoc, ky } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response("Invalid items data", { status: 400 });
    }

    const results = {
      success: [],
      duplicates: [],
      errors: []
    };

    for (const item of items) {
      try {
        const {
          maHocPhan,
          hocPhan,
          lop,
          ngayThi,
          ca,
          phong,
          cbo1,
          cbo2,
          hinhThuc,
          thoiGian
        } = item;

        // Validate dữ liệu cơ bản
        if (!hocPhan || !ngayThi || !user) {
          results.errors.push({
            item,
            error: 'Thiếu thông tin bắt buộc (hocPhan, ngayThi, user)'
          });
          continue;
        }

        // Kiểm tra trùng lặp
        const duplicateQuery = {
          hocPhan,
          ngayThi,
          user,
          namHoc,
          ky
        };

        const existingRecord = await PcCoiThi.findOne(duplicateQuery);

        if (existingRecord) {
          results.duplicates.push({
            item,
            existing: existingRecord
          });
          continue;
        }

        // Tạo bản ghi mới
        const newRecord = await PcCoiThi.create({
          maHocPhan: maHocPhan || '',
          hocPhan: Array.isArray(hocPhan) ? hocPhan : [hocPhan],
          lop: Array.isArray(lop) ? lop : (lop ? [lop] : []),
          ngayThi,
          ca: ca || '1',
          phong: Array.isArray(phong) ? phong : (phong ? [phong] : []),
          cbo1: Array.isArray(cbo1) ? cbo1 : (cbo1 ? [cbo1] : []),
          cbo2: Array.isArray(cbo2) ? cbo2 : (cbo2 ? [cbo2] : []),
          hinhThuc: Array.isArray(hinhThuc) ? hinhThuc : (hinhThuc ? [hinhThuc] : []),
          thoiGian: Array.isArray(thoiGian) ? thoiGian : (thoiGian ? [thoiGian] : []),
          type,
          user,
          namHoc,
          ky
        });

        results.success.push(newRecord);

      } catch (itemError) {
        console.error('Error processing PcCoiThi item:', item, itemError);
        results.errors.push({
          item,
          error: itemError.message
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Import PcCoiThi hoàn tất: ${results.success.length} bản ghi mới, ${results.duplicates.length} bản ghi trùng lặp, ${results.errors.length} bản ghi lỗi`,
      results
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('PcCoiThi bulk import error:', err);
    return new Response(`Failed to bulk import PcCoiThi: ${err.message}`, { status: 500 });
  }
};
