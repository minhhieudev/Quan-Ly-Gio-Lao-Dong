export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import CongTacCoiThi from "@models/CongTacCoiThi";

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
        const { hocPhan, ngayThi, thoiGianThi, soTietQuyChuan, ghiChu } = item;

        // Validate dữ liệu cơ bản
        if (!hocPhan || !ngayThi || !user) {
          results.errors.push({
            item,
            error: 'Thiếu thông tin bắt buộc'
          });
          continue;
        }

        // Kiểm tra trùng lặp
        const duplicateQuery = {
          hocPhan,
          namHoc,
          user,
          ky,
          ngayThi
        };

        const existingRecord = await CongTacCoiThi.findOne(duplicateQuery);

        if (existingRecord) {
          results.duplicates.push({
            item,
            existing: existingRecord
          });
          continue;
        }

        // Tạo bản ghi mới
        const newRecord = await CongTacCoiThi.create({
          hocPhan,
          ngayThi,
          thoiGianThi,
          soTietQuyChuan,
          ghiChu: ghiChu || '', // Để trống nếu không có
          type,
          user,
          namHoc,
          ky
        });

        results.success.push(newRecord);

      } catch (itemError) {
        console.error('Error processing item:', item, itemError);
        results.errors.push({
          item,
          error: itemError.message
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Import hoàn tất: ${results.success.length} bản ghi mới, ${results.duplicates.length} bản ghi trùng lặp, ${results.errors.length} bản ghi lỗi`,
      results
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Bulk import error:', err);
    return new Response(`Failed to bulk import: ${err.message}`, { status: 500 });
  }
};
