import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import ChucVu from "@models/ChucVu";
import { connectToDB } from "@mongodb";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu với điều kiện tìm kiếm và phân trang
    const data = await PhanCongKiemNhiem.find()
      .populate('chucVu', 'tenCV loaiCV') // Populate trường chucVu
      .populate('user', 'username khoa') // Populate trường user
    // Lấy tổng số bản ghi để tính toán phân trang
    console.log(data);
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
    const { chucVu, startTime, endTime, user, ghiChu } = await req.json();

    let existing = await PhanCongKiemNhiem.findOne({ user, chucVu });

    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.ghiChu = ghiChu;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new PhanCongKiemNhiem({
        chucVu,
        startTime,
        endTime,
        user,
        ghiChu
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
    const { id, chucVu, startTime, endTime, user, ghiChu } = await req.json();
    const Update = await PhanCongKiemNhiem.findById(id);

    if (!Update) {
      return new Response("Chuc vu not found", { status: 404 });
    }

    Update.chucVu = chucVu;
    Update.startTime = startTime;
    Update.endTime = endTime;
    Update.user = user;
    Update.ghiChu = ghiChu;

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
