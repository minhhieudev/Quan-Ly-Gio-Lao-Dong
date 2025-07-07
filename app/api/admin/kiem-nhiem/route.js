import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import ChucVu from "@models/ChucVu";
import Khoa from "@models/Khoa"; // import model Khoa
import { connectToDB } from "@mongodb";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu với điều kiện tìm kiếm và phân trang sử dụng aggregate để join với khoa
    const data = await PhanCongKiemNhiem.aggregate([
      {
        $lookup: {
          from: "chucvus",
          localField: "chucVu",
          foreignField: "_id",
          as: "chucVuInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $lookup: {
          from: "khoas",
          localField: "userInfo.maKhoa",
          foreignField: "maKhoa",
          as: "khoaInfo"
        }
      },
      {
        $addFields: {
          chucVu: { $arrayElemAt: ["$chucVuInfo", 0] },
          user: {
            $mergeObjects: [
              { $arrayElemAt: ["$userInfo", 0] },
              { khoa: { $arrayElemAt: ["$khoaInfo.tenKhoa", 0] } }
            ]
          }
        }
      },
      {
        $project: {
          chucVuInfo: 0,
          userInfo: 0,
          khoaInfo: 0
        }
      }
    ]);
    // Lấy tổng số bản ghi để tính toán phân trang
    return new Response(JSON.stringify(data ), { status: 200 });

  } catch (err) {
    console.log(err);
    return new Response("Failed to get all PhanCongKiemNhiem", { status: 500 });
  }
};

// POST (Create new department)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    let { chucVu, startTime, endTime, user, ghiChu, schoolYearStart, schoolYearEnd } = await req.json();
    console.log( 'schoolYearStart:', schoolYearEnd);
    // Gán mặc định nếu thiếu
    if (!startTime) startTime = schoolYearStart;

    let existing = await PhanCongKiemNhiem.findOne({ user, chucVu });

    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.ghiChu = ghiChu;
      existing.schoolYearStart = schoolYearStart;
      existing.schoolYearEnd = schoolYearEnd;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new PhanCongKiemNhiem({
        chucVu,
        startTime,
        endTime,
        user,
        ghiChu,
        schoolYearStart,
        schoolYearEnd
      });

      await newCV.save();
      return new Response(JSON.stringify(newCV), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update phan cong kiem nhiem", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    let { id, chucVu, startTime, endTime, user, ghiChu, schoolYearStart, schoolYearEnd } = await req.json();

    // Gán mặc định nếu thiếu
    if (!startTime) startTime = schoolYearStart;
    if (!endTime) endTime = schoolYearEnd;

    const Update = await PhanCongKiemNhiem.findById(id);

    if (!Update) {
      return new Response("Chuc vu not found", { status: 404 });
    }

    Update.chucVu = chucVu;
    Update.startTime = startTime;
    Update.endTime = endTime;
    Update.user = user;
    Update.ghiChu = ghiChu;
    Update.schoolYearStart = schoolYearStart;
    Update.schoolYearEnd = schoolYearEnd;
    await Update.save();

    return new Response(JSON.stringify(Update), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update chuc vu", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa khoa
    const Delete = await PhanCongKiemNhiem.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Chuc Vu not found", { status: 404 });
    }

    return new Response("Xóa thành công", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete department", { status: 500 });
  }
};
