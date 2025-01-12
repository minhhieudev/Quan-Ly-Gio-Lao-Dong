import HuongDan from "@models/HuongDan";
import { connectToDB } from "@mongodb";

export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allDepartments = await HuongDan.find();

    return new Response(JSON.stringify(allDepartments), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all HuongDan", { status: 500 });
  }
};

// POST (Create new department)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { tenCV, moTa, soGio } = await req.json();

    let existing = await HuongDan.findOne({ tenCV: { $regex: new RegExp(`^${tenCV}$`, 'i') } });

    if (existing) {
      existing.moTa = moTa;
      existing.soGio = soGio;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new HuongDan({
        tenCV,
        moTa,
        soGio
      });

      await newCV.save();
      return new Response(JSON.stringify(newCV), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update huong dan", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id,tenCV, moTa, soGio } = await req.json();

    const Update = await HuongDan.findById(id);

    if (!Update) {
      return new Response("Cong viec not found", { status: 404 });
    }

    Update.tenCV = tenCV;
    Update.moTa = moTa;
    Update.soGio = soGio;

    await Update.save();

    return new Response(JSON.stringify(Update), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update cong viec", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa khoa
    const Delete = await HuongDan.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Cong viec not found", { status: 404 });
    }

    return new Response("Cong viec deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete Cong viec", { status: 500 });
  }
};
