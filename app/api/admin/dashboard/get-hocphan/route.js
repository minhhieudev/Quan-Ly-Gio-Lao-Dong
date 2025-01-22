import { connectToDB } from '@mongodb';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

// Kích hoạt các plugin
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const GET = async (req) => {
  try {
    await connectToDB();

    
    return new Response(JSON.stringify([]), { status: 200 });
  } catch (err) {
    console.error("Lỗi khi lấy thống kê coi thi:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
