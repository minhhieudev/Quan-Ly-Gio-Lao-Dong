import Setting from "@models/Setting";
import { connectToDB } from "@mongodb";

// GET: Lấy tất cả setting (hoặc chỉ lấy noty)
export const GET = async (req, res) => {
  try {
    await connectToDB();
    const allSettings = await Setting.find();
    return new Response(JSON.stringify(allSettings), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get settings", { status: 500 });
  }
};

// POST: Tạo mới một setting (chỉ ví dụ, thường chỉ có 1 setting)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { noty, schoolYearStart, schoolYearEnd, startRegulation, endRegulation } = await req.json();

    const newSetting = new Setting({
      noty,
      schoolYearStart,
      schoolYearEnd,
      startRegulation,
      endRegulation,
    });

    await newSetting.save();
    return new Response(JSON.stringify(newSetting), { status: 201 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to create setting", { status: 500 });
  }
};

// PUT: Cập nhật noty (hoặc các trường khác) cho một setting
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id, noty, schoolYearStart, schoolYearEnd, startRegulation, endRegulation } = await req.json();

    const settingToUpdate = await Setting.findById(id);

    if (!settingToUpdate) {
      return new Response("Setting not found", { status: 404 });
    }

    if (noty !== undefined) settingToUpdate.noty = noty;
    if (schoolYearStart !== undefined) settingToUpdate.schoolYearStart = schoolYearStart;
    if (schoolYearEnd !== undefined) settingToUpdate.schoolYearEnd = schoolYearEnd;
    if (startRegulation !== undefined) settingToUpdate.startRegulation = startRegulation;
    if (endRegulation !== undefined) settingToUpdate.endRegulation = endRegulation;

    await settingToUpdate.save();

    return new Response(JSON.stringify(settingToUpdate), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update setting", { status: 500 });
  }
};

