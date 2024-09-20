import { connectToDB } from '@mongodb';
import PcCoiThi from "@models/PcCoiThi";


export const GET = async (req) => {
  try {
    await connectToDB();
    
    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    //const ky = searchParams.get('ky');
    //const gvGiangDay = searchParams.get('gvGiangDay');
    const cb = 'Võ Thị Tem';
    //const cb = searchParams.get('gvGiangDay') || 'Võ Thị Tem';

    let filter = {};
    
    if (namHoc) {
      filter.namHoc = namHoc;
    }

    // if (ky) {
    //   filter.ky = ky;
    // }

    if (cb) {
      filter.$or = [
        { cb1: cb },
        { cb2: cb }
      ];
    }

    // if (!namHoc ) {
    //   return new Response("Thiếu tham số namHoc .", { status: 400 });
    // }

    const pcGiangDays = await PcCoiThi.find(filter);

    return new Response(JSON.stringify(pcGiangDays), { status: 200 });
  } catch (err) {
    console.error("Error fetching PcCoiThi:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

