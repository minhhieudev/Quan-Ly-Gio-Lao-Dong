import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import User from "@models/User";
import ChucVu from "@models/ChucVu";
import { connectToDB } from "@mongodb";

export const POST = async (req) => {
  try {
    await connectToDB();

    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    const errors = [];
    const processed = await Promise.all(
      data.map(async (item, idx) => {
        // Query lấy id user và chucVu
        const userDoc = await User.findOne({ maGV: item.user });
        const chucVuDoc = await ChucVu.findOne({ maCV: item.chucVu });

        if (!userDoc || !chucVuDoc) {
          errors.push({
            index: idx + 1,
            stt: item.stt,
            user: item.user,
            chucVu: item.chucVu,
            reason: !userDoc ? "Không tìm thấy user" : "Không tìm thấy chức vụ"
          });
          return null;
        }

        const updated = await PhanCongKiemNhiem.findOneAndUpdate(
          {
            user: userDoc._id,
            chucVu: chucVuDoc._id,
            schoolYearStart: item.schoolYearStart,
            schoolYearEnd: item.schoolYearEnd,
            startTime: item.startTime,
            endTime: item.endTime,
          },
          {

            ghiChu: item.ghiChu,
          },
          { new: true, upsert: true }
        );

        return updated;
      })
    );

    // Lọc bỏ các bản ghi null (không tìm thấy user/chucVu)
    const filtered = processed.filter(Boolean);

    // Trả về cả thành công và lỗi
    return new Response(JSON.stringify({
      success: filtered,
      errors
    }), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process import ngach" }), { status: 500 });
  }
};
