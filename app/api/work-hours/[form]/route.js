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
    const { hocPhan, namHoc, user, ky } = body;
    const existingRecord = await model.findOne({ hocPhan, namHoc, user, ky });

    if (existingRecord) {
      // Nếu bản ghi đã tồn tại, cập nhật bản ghi
      const updatedRecord = await model.findByIdAndUpdate(existingRecord._id, body, { new: true });
      return new Response(JSON.stringify(updatedRecord), { status: 200 });
    } else {
      // Nếu không tồn tại, tạo bản ghi mới
      const newRecord = await model.create(body);
      return new Response(JSON.stringify(newRecord), { status: 200 });
    }
  } catch (err) {
    console.log(err);
    return new Response(`Failed to create or update ${form} record`, { status: 500 });
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
    console.log(err);
    return new Response(`Failed to update ${form} record`, { status: 500 });
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
    console.log(err);
    return new Response(`Failed to delete ${form} record`, { status: 500 });
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

    if (form == 'CongTacKiemNhiem' && records.length < 1) {
      let kiemNhiem = []
      let maNgachInfo
      const currentUser = await User.find({ _id: user })

      if (currentUser) {
        maNgachInfo = await MaNgach.findOne({ maNgach: currentUser[0].maNgach }, 'GCGD');
      }

      const data = await PhanCongKiemNhiem.find({ user })
        .populate('user', 'username khoa')
        .populate('chucVu');
      if (data) {
        // Parse namHoc to get start and end year
        let namHocStart = null, namHocEnd = null;
        if (namHoc && namHoc.includes('-')) {
          const [start, end] = namHoc.split('-');
          namHocStart = parseInt(start);
          namHocEnd = parseInt(end);
        }
        data.forEach(item => {
          if (item.schoolYearStart && namHocStart) {
            const schoolYearStartYear = new Date(item.schoolYearStart).getFullYear();
            if (schoolYearStartYear === namHocStart) {
              // Nếu không có endTime thì dùng schoolYearEnd
              const endTime = item.endTime || item.schoolYearEnd;
              kiemNhiem.push({
                chucVuCongViec: item.chucVu.tenCV,
                maCV: item.chucVu.maCV,
                thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(endTime).toLocaleDateString('vi-VN')}`,
                tyLeMienGiam: item.chucVu.soMien,
                soTietQC: Math.max(0, item.chucVu.soMien < 1 ? item.chucVu.soMien * maNgachInfo.GCGD : item.chucVu.soMien),
                ghiChu: item.ghiChu,
                namHoc: namHoc,
                user: item.user,
                startTime: item.startTime,
                endTime: endTime
              });
            }
          }
        });
      }

      if (kiemNhiem) {
        for (const item of kiemNhiem) {
          const existingRecord = await CongTacKiemNhiem.findOne({
            chucVuCongViec: item.chucVuCongViec,
            namHoc: item.namHoc,
            user: item.user
          });

          if (existingRecord) {
            // Update existing record
            await CongTacKiemNhiem.findByIdAndUpdate(existingRecord._id, {
              thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(item.endTime).toLocaleDateString('vi-VN')}`,
              tyLeMienGiam: item.tyLeMienGiam,
              soTietQC: item.soTietQC,
              ghiChu: item.ghiChu
            });
          } else {
            // Create new record
            await CongTacKiemNhiem.create({
              chucVuCongViec: item.chucVuCongViec,
              maCV: item.maCV,
              thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(item.endTime).toLocaleDateString('vi-VN')}`,
              tyLeMienGiam: item.tyLeMienGiam,
              soTietQC: item.soTietQC,
              ghiChu: item.ghiChu,
              namHoc: item.namHoc,
              user: item.user,
              type: type1
            });
          }
        }
      }
    }
    else {
      let kiemNhiem = []
      let maNgachInfo
      const currentUser = await User.find({ _id: user })

      if (currentUser) {
        maNgachInfo = await MaNgach.findOne({ maNgach: currentUser[0].maNgach }, 'GCGD');
      }

      const data = await PhanCongKiemNhiem.find({ user })
        .populate('user', 'username khoa')
        .populate('chucVu');

      if (data) {
        // Parse namHoc to get start and end year
        let namHocStart = null, namHocEnd = null;
        if (namHoc && namHoc.includes('-')) {
          const [start, end] = namHoc.split('-');
          namHocStart = parseInt(start);
          namHocEnd = parseInt(end);
        }
        data.forEach(item => {
          if (item.schoolYearStart && namHocStart) {
            const schoolYearStartYear = new Date(item.schoolYearStart).getFullYear();
            if (schoolYearStartYear === namHocStart) {
              // Nếu không có endTime thì dùng schoolYearEnd
              const endTime = item.endTime || item.schoolYearEnd;
              kiemNhiem.push({
                chucVuCongViec: item.chucVu.tenCV,
                maCV: item.chucVu.maCV,
                thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(endTime).toLocaleDateString('vi-VN')}`,
                tyLeMienGiam: item.chucVu.soMien,
                soTietQC: Math.max(0, item.chucVu.soMien < 1 ? item.chucVu.soMien * maNgachInfo.GCGD : item.chucVu.soMien),
                ghiChu: item.ghiChu,
                namHoc: namHoc,
                user: item.user,
                startTime: item.startTime,
                endTime: endTime
              });
            }
          }
        });
      }

      if (kiemNhiem) {
        for (const item of kiemNhiem) {
          const existingRecord = await CongTacKiemNhiem.findOne({
            chucVuCongViec: item.chucVuCongViec,
            namHoc: item.namHoc,
            user: item.user,
            type: type1,
            thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(item.endTime).toLocaleDateString('vi-VN')}`
          });

          if (!existingRecord) {
            // Only create new record if it doesn't exist
            await CongTacKiemNhiem.create({
              ...item,
              user: item.user,
              type: type1
            });
          }
          // THÊM ĐOẠN UPDATE NÀY
          else {
            await CongTacKiemNhiem.findByIdAndUpdate(existingRecord._id, {
              thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(item.endTime).toLocaleDateString('vi-VN')}`,
              tyLeMienGiam: item.tyLeMienGiam,
              soTietQC: item.soTietQC,
              ghiChu: item.ghiChu
            });
          }
        }
      }
    }


    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve ${form} records`, { status: 500 });
  }
};

