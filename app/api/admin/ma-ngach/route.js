import MaNgach from "@models/MaNgach";
import { connectToDB } from "@mongodb";

// GET all departments
export const GET = async (req, res) => {
  try {
    await connectToDB();

    const alls = await MaNgach.find();

    return new Response(JSON.stringify(alls), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all ma ngach", { status: 500 });
  }
};

// POST (Create new department)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { tenNgach, maNgach,GCGD,GCNCKH,GCPVCD } = await req.json();

    let existing = await MaNgach.findOne({ maNgach });

    if (existing) {
      existing.tenNgach = tenNgach;
      existing.GCGD = GCGD;
      existing.GCNCKH = GCNCKH;
      existing.GCPVCD = GCPVCD;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      // Nếu chưa tồn tại, tạo mới khoa
      const newNgach = new MaNgach({
        tenNgach,
        maNgach,
        GCGD,
        GCNCKH,
        GCPVCD
      });

      await newNgach.save();
      return new Response(JSON.stringify(newNgach), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update Ngach", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id,tenNgach,maNgach,GCGD,GCNCKH,GCPVCD } = await req.json();

    const Update = await MaNgach.findById(id);

    if (!Update) {
      return new Response("Ngach not found", { status: 404 });
    }

    Update.tenNgach = tenNgach;
    Update.maNgach = maNgach;
    Update.GCGD = GCGD;
    Update.GCNCKH = GCNCKH;
    Update.GCPVCD = GCPVCD;

    await Update.save();

    return new Response(JSON.stringify(Update), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update Ngach", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    const Delete = await MaNgach.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Ngach not found", { status: 404 });
    }

    return new Response("Ngach deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete Ngach", { status: 500 });
  }
};
