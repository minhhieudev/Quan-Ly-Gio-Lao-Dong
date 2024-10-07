import User from "@models/User";
import { connectToDB } from "@mongodb";

export const POST = async (req) => {
  try {
    await connectToDB();

    // Lấy dữ liệu từ body của yêu cầu
    const { users } = await req.json();

    console.log("Dữ liệu nhận được:", users);

    if (!users || !Array.isArray(users)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    // Duyệt qua danh sách users và xử lý từng user
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        const maGV = user[0];
        const maNgach = user[3];

        let GCGD = 0
        let GCNCKH = 0
        let GCPVCD = 0

        if (maNgach) {
          if (maNgach == 'V07.01.01') {
            GCGD = 230
            GCNCKH = 300
            GCPVCD = 57
          }
          if (maNgach == 'V07.01.02') {
            GCGD = 250
            GCNCKH = 260
            GCPVCD = 77
          }
          if (maNgach == 'V07.01.03') {
            GCGD = 270
            GCNCKH = 195
            GCPVCD = 121
          }
        }

        // Tìm và cập nhật nếu người dùng tồn tại, nếu không thì tạo mới
        const updatedUser = await User.findOneAndUpdate(
          { maGV },
          {
            username: user[1], // Cập nhật các trường thông tin
            khoa: user[2],
            maNgach: user[3],
            GCGD,
            GCNCKH,
            GCPVCD
          },
          { new: true, upsert: true } // Nếu không tìm thấy thì tạo mới
        );

        return updatedUser;
      })
    );

    // Trả về danh sách người dùng đã xử lý
    return new Response(JSON.stringify(processedUsers), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process users" }), { status: 500 });
  }
};
