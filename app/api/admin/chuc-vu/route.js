import ChucVu from "@models/ChucVu";
import { connectToDB } from "@mongodb";

export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allDepartments = await ChucVu.find();

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
    const { tenCV, maCV, loaiCV, soMien } = await req.json();

    let existing = await ChucVu.findOne({ maCV });

    if (existing) {
      existing.tenCV = tenCV;
      existing.loaiCV = loaiCV;
      existing.soMien = soMien;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new ChucVu({
        tenCV,
        maCV,
        loaiCV,
        soMien
      });

      await newCV.save();
      return new Response(JSON.stringify(newCV), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update chuc vu", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id, tenCV, maCV, loaiCV, soMien } = await req.json();

    const Update = await ChucVu.findById(id);

    if (!Update) {
      return new Response("Chuc vu not found", { status: 404 });
    }

    Update.tenCV = tenCV;
    Update.maCV = maCV;
    Update.loaiCV = loaiCV;
    Update.soMien = soMien;

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
    const Delete = await ChucVu.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Chuc Vu not found", { status: 404 });
    }

    return new Response("Chuc Vu deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete department", { status: 500 });
  }
};
