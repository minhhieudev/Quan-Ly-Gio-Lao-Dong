import User from "@models/User";
import ChucVu from "@models/ChucVu";
import MaNgach from "@models/MaNgach";
import { connectToDB } from "@mongodb";

export const POST = async (req) => {
  try {
    await connectToDB();

    const { users } = await req.json();

    console.log("Dữ liệu nhận được:", users);

    if (!users || !Array.isArray(users)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    // Duyệt qua danh sách users và xử lý từng user
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        const maGV = user[1];
        const maNgach = user[6];
        const maCV = user[3];

        // Lấy thông tin từ bảng MaNgach dựa trên maNgach
        const maNgachData = await MaNgach.findOne({ maNgach });

        // Tính toán giá trị dinhMucGioChuan dựa trên dữ liệu MaNgach
        const dinhMucGioChuan = maNgachData 
          ? maNgachData.GCGD + maNgachData.GCNCKH + maNgachData.GCPVCD
          : 0;

        // Cập nhật các mảng chucVuChinhQuyen, chucVuKiemNhiem, chucVuDoanTheXH
        let chucVuChinhQuyen = [];
        let chucVuKiemNhiem = [];
        let chucVuDoanTheXH = [];

        if (user[5] === "Chính quyền") {
          chucVuChinhQuyen.push(user[4]);
        }

        if (user[5] === "Cố vấn học tập" || user[5] === "Giáo vụ khoa") {
          chucVuKiemNhiem.push(user[4]);
        }

        if (["Công đoàn", "Đảng", "Đoàn Hội"].includes(user[5])) {
          chucVuDoanTheXH.push(user[4]);
        }

        // Tìm và cập nhật nếu người dùng tồn tại, nếu không thì tạo mới
        const updatedUser = await User.findOneAndUpdate(
          { maGV },
          {
            username: user[1], // Cập nhật các trường thông tin
            maNgach, // để lấy giờ chuẩn giảng dạy và 2 cái nữa
            maCV, // để lấy miễn giảm GD  và nhân với gcgd để lấy số giờ miễn giảm   ví dụ 0.15 * 270
            dinhMucGioChuan, // Gán giá trị dinhMucGioChuan đã tính toán
            chucVuChinhQuyen: chucVuChinhQuyen.length ? chucVuChinhQuyen : ["Không"],
            chucVuKiemNhiem: chucVuKiemNhiem.length ? chucVuKiemNhiem : ["Không"],
            chucVuDoanTheXH: chucVuDoanTheXH.length ? chucVuDoanTheXH : ["Không"],
          },
          { new: true, upsert: true } // Nếu không tìm thấy thì tạo mới
        );

        return updatedUser;
      })
    );

    return new Response(JSON.stringify(processedUsers), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process users" }), { status: 500 });
  }
};
