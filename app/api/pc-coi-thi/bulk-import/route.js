export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import PcCoiThi from "@models/PcCoiThi";

export const POST = async (req) => {
  try {
    await connectToDB();
    const { items, type, namHoc, ky } = await req.json();

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
          thoiGian,
          loaiKyThi
        } = item;

        // Validate dữ liệu cơ bản
        if (!hocPhan || !ngayThi) {
          results.errors.push({
            item,
            error: 'Thiếu thông tin bắt buộc (hocPhan, ngayThi)'
          });
          continue;
        }

        // Kiểm tra trùng lặp
        const duplicateQuery = {
          hocPhan,
          ngayThi,
          namHoc,
          ky
        };

        const existingRecord = await PcCoiThi.findOne(duplicateQuery);

        if (existingRecord) {
          // Cập nhật bản ghi hiện có - chỉ cập nhật trường tương ứng
          try {
            // Giữ nguyên dữ liệu cũ
            let newCbo1 = existingRecord.cbo1 || [];
            let newCbo2 = existingRecord.cbo2 || [];

            // Chỉ cập nhật trường có dữ liệu mới - KHÔNG MERGE
            if (cbo1 && Array.isArray(cbo1) && cbo1.length > 0) {
              newCbo1 = [...cbo1]; // Chỉ lấy dữ liệu mới, không merge với cũ
            }

            if (cbo2 && Array.isArray(cbo2) && cbo2.length > 0) {
              newCbo2 = [...cbo2]; // Chỉ lấy dữ liệu mới, không merge với cũ
            }

            const updatedRecord = await PcCoiThi.findByIdAndUpdate(
              existingRecord._id,
              {
                maHocPhan: maHocPhan || existingRecord.maHocPhan,
                hocPhan: Array.isArray(hocPhan) ? hocPhan : [hocPhan],
                lop: Array.isArray(lop) ? lop : (lop ? [lop] : existingRecord.lop),
                ngayThi,
                ca: ca || existingRecord.ca,
                phong: Array.isArray(phong) ? phong : (phong ? [phong] : existingRecord.phong),
                cbo1: newCbo1,
                cbo2: newCbo2,
                hinhThuc: Array.isArray(hinhThuc) ? hinhThuc : (hinhThuc ? [hinhThuc] : existingRecord.hinhThuc),
                thoiGian: Array.isArray(thoiGian) ? thoiGian : (thoiGian ? [thoiGian] : existingRecord.thoiGian),
                loaiKyThi: loaiKyThi || existingRecord.loaiKyThi,
                type,
                namHoc,
                ky
              },
              { new: true }
            );

            results.success.push(updatedRecord);
            continue;
          } catch (updateError) {
            results.errors.push({
              item,
              error: 'Lỗi khi cập nhật bản ghi: ' + updateError.message
            });
            continue;
          }
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
          loaiKyThi: loaiKyThi || '1',
          type,
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
      message: `Import PcCoiThi hoàn tất: ${results.success.length} bản ghi (tạo mới + cập nhật), ${results.duplicates.length} bản ghi bỏ qua, ${results.errors.length} bản ghi lỗi`,
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
