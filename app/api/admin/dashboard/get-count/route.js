import { connectToDB } from '@mongodb';
import PcChamThi from "@models/PcChamThi";
import User from "@models/User";
import dayjs from "dayjs";

export const GET = async (req) => {
  try {
    await connectToDB();

   

    return new Response(JSON.stringify([]), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi lấy thống kê :", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
