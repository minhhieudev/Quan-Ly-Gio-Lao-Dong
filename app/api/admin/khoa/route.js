import Khoa from "@models/Khoa";
import { connectToDB } from "@mongodb";

// GET all departments
export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allDepartments = await Khoa.find();

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
    const { tenKhoa, maKhoa } = await req.json();

    // Kiểm tra khoa đã tồn tại
    let existingDepartment = await Khoa.findOne({ maKhoa });

    if (existingDepartment) {
      // Nếu tồn tại, cập nhật thông tin
      existingDepartment.tenKhoa = tenKhoa;
      await existingDepartment.save();

      return new Response(JSON.stringify(existingDepartment), { status: 200 });
    } else {
      // Nếu chưa tồn tại, tạo mới khoa
      const newDepartment = new Khoa({
        tenKhoa,
        maKhoa,
      });

      await newDepartment.save();
      return new Response(JSON.stringify(newDepartment), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update department", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id, tenKhoa, maKhoa } = await req.json();

    const departmentToUpdate = await Khoa.findById(id);

    if (!departmentToUpdate) {
      return new Response("Khoa not found", { status: 404 });
    }

    departmentToUpdate.tenKhoa = tenKhoa;
    departmentToUpdate.maKhoa = maKhoa;

    await departmentToUpdate.save();

    return new Response(JSON.stringify(departmentToUpdate), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update department", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa khoa
    const departmentToDelete = await Khoa.findByIdAndDelete(id);

    if (!departmentToDelete) {
      return new Response("Khoa not found", { status: 404 });
    }

    return new Response("Khoa deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete department", { status: 500 });
  }
};
