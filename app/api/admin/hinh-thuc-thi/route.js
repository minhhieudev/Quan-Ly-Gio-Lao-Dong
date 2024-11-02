import HinhThucThi from "@models/HinhThucThi";
import { connectToDB } from "@mongodb";

export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allDepartments = await HinhThucThi.find();

    return new Response(JSON.stringify(allDepartments), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all departments", { status: 500 });
  }
};

// POST (Create new department)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { ten,soLuong,soGio } = await req.json();

    let existing = await HinhThucThi.findOne({ ten });

    if (existing) {
      existing.soLuong = soLuong;
      existing.soGio = soGio;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new HinhThucThi({
        ten,
        soLuong,
        soGio
      });

      await newCV.save();
      return new Response(JSON.stringify(newCV), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update hinh thuc thi", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { ten,soLuong,soGio} = await req.json();

    const Update = await HinhThucThi.findById(id);

    if (!Update) {
      return new Response("Not found", { status: 404 });
    }

    Update.ten = ten;
    Update.soLuong = soLuong;
    Update.soGio = soGio;

    await Update.save();

    return new Response(JSON.stringify(Update), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update ", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa khoa
    const Delete = await HinhThucThi.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Chuc Vu not found", { status: 404 });
    }

    return new Response("Chuc Vu deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete department", { status: 500 });
  }
};
