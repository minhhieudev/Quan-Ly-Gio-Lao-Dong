export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcChamThi from "@models/PcChamThi";

export const GET = async (req) => {
  try {
    await connectToDB();
    
    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    //const ky = searchParams.get('ky');
    const cb =  'Võ Thị Tem';

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

    // Tìm kiếm các bản ghi phân công chấm thi theo điều kiện filter
    const PcChamThis = await PcChamThi.find(filter);

    // Trả về phản hồi thành công
    return new Response(JSON.stringify(PcChamThis), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error fetching PcChamThi:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

    //const gvGiangDay = searchParams.get('gvGiangDay');
