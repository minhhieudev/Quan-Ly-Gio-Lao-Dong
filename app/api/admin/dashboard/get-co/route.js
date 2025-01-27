import { connectToDB } from '@mongodb';
import PcChamThi from "@models/PcChamThi";

export const GET = async (req) => {
    try {
        await connectToDB();

        // Cập nhật trường 'ky' của tất cả đối tượng với giá trị "1"
        const result = await PcChamThi.updateMany(
            {}, // Điều kiện trống để cập nhật tất cả tài liệu
            { $set: { ky: "1" } } // Cập nhật trường 'ky' với giá trị "1"
        );

        return new Response(JSON.stringify({ 
            message: `Đã cập nhật trường 'ky' cho ${result.modifiedCount} đối tượng`,
            success: true 
        }), { status: 200 });

    } catch (err) {
        console.error("Lỗi khi cập nhật trường 'ky':", err);
        return new Response(JSON.stringify({ 
            message: `Lỗi: ${err.message}`,
            success: false 
        }), { status: 500 });
    }
};
