import { connectToDB } from '@mongodb';
import User from "@models/User";

export const GET = async (req) => {
    try {
        await connectToDB();

        // Danh sách học vị có thể có
        const hocViList = ['Thạc sĩ', 'Tiến sĩ'];

        // Lấy danh sách tất cả users cần cập nhật
        const users = await User.find({ role: "user" });

        // Cập nhật từng user với học vị ngẫu nhiên
        const updatePromises = users.map(async (user) => {
            // Chọn ngẫu nhiên một học vị
            const randomHocVi = hocViList[Math.floor(Math.random() * hocViList.length)];
            
            // Cập nhật user với học vị ngẫu nhiên
            return User.findByIdAndUpdate(
                user._id,
                { hocHamHocVi: randomHocVi },
                { new: true }
            );
        });

        // Thực hiện tất cả các cập nhật
        await Promise.all(updatePromises);

        return new Response(JSON.stringify({ 
            message: `Đã cập nhật học vị cho ${users.length} giảng viên`,
            success: true 
        }), { status: 200 });

    } catch (err) {
        console.error("Lỗi khi cập nhật học vị:", err);
        return new Response(JSON.stringify({ 
            message: `Lỗi: ${err.message}`,
            success: false 
        }), { status: 500 });
    }
};
