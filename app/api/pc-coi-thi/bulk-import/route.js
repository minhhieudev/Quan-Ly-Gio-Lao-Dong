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

    console.log(items);
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
          // Cập nhật bản ghi hiện có với logic merge thông minh cho cbo1/cbo2
          try {
            // Xử lý merge cbo1 và cbo2
            let newCbo1 = existingRecord.cbo1 || [];
            let newCbo2 = existingRecord.cbo2 || [];

            // Nếu có dữ liệu cbo1 mới và chưa tồn tại
            if (cbo1 && Array.isArray(cbo1) && cbo1.length > 0) {
              cbo1.forEach(cb => {
                if (cb && !newCbo1.includes(cb)) {
                  newCbo1.push(cb);
                }
              });
            }

            // Nếu có dữ liệu cbo2 mới và chưa tồn tại
            if (cbo2 && Array.isArray(cbo2) && cbo2.length > 0) {
              cbo2.forEach(cb => {
                if (cb && !newCbo2.includes(cb)) {
                  newCbo2.push(cb);
                }
              });
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
