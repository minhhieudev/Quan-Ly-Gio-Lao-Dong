import User from "@models/User";
import { connectToDB } from "@mongodb";
import { hash } from 'bcryptjs';

export const POST = async (req) => {
  try {
    await connectToDB();

    const { users } = await req.json();
    const hashedPassword = await hash("123456@", 10);

    if (!users || !Array.isArray(users)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    // Duyệt qua danh sách users và xử lý từng user
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        const maGV = user[0];
        const maNgach = user[4];
        //const maCV = user[3];

        // Tạo email mặc định
        const email = `${maGV}@pyu.edu.vn`;

        // Tìm và cập nhật nếu người dùng tồn tại, nếu không thì tạo mới
        const updatedUser = await User.findOneAndUpdate(
          { maGV },
          {
            username: user[1], // Cập nhật các trường thông tin
            maKhoa: user[2],
            email,
            password: hashedPassword,
            maNgach, // để lấy giờ chuẩn giảng dạy và 2 cái nữa

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
