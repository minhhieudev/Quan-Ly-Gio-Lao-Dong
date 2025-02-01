export const dynamic = 'force-dynamic';

import { connectToDB } from "@mongodb";
import TongHopLaoDong from "@models/TongHopLaoDong";

export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    console.log(body);

    const gioChuan = 0;
    const chuanNamHoc = 1;
    const tongGioChinhQuy = body.congTacGiangDay.tong + body.congTacKhac.tong;
    const thuaThieuGioLaoDong = tongGioChinhQuy - chuanNamHoc;

    const data = {
      ...body,
      gioChuan,
      chuanNamHoc,
      tongGioChinhQuy,
      thuaThieuGioLaoDong,
    };

    // Kiểm tra xem bản ghi đã tồn tại chưa
    const existingRecord = await TongHopLaoDong.findOne({ 
      user: body.user, // Giả sử bạn có trường user trong body
      loai: body.loai, // Giả sử bạn có trường loai trong body
      namHoc: body.namHoc // Giả sử bạn có trường namHoc trong body
    });

    if (existingRecord) {
      // Nếu tồn tại, cập nhật bản ghi
      const updatedRecord = await TongHopLaoDong.findOneAndUpdate(
        { _id: existingRecord._id }, // Tìm bản ghi theo ID
        data, // Cập nhật với dữ liệu mới
        { new: true } // Trả về bản ghi đã cập nhật
      );
      return new Response(JSON.stringify(updatedRecord), { status: 200 });
    } else {
      // Nếu không tồn tại, tạo mới bản ghi
      const newRecord = await TongHopLaoDong.create(data);
      return new Response(JSON.stringify(newRecord), { status: 200 });
    }
  } catch (err) {
    console.log(err);
    return new Response(`Failed to create or update record`, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    await connectToDB();
    const { id } = await req.json();
    await TongHopLaoDong.findByIdAndDelete(id);
    return new Response(`$Deleted successfully`, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to delete record`, { status: 500 });
  }
};

export const GET = async (req, { params }) => {
  try {
    const { type } = params;

    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const namHoc = url.searchParams.get('namHoc');
    //const ky = url.searchParams.get('ky'); 
    const query = {};

    if (namHoc && namHoc !== 'undefined') {
      query.namHoc = namHoc;
    }

    if (type) {
      query.loai = type
    }

    // if (ky && ky !== 'undefined') {
    //   query.ky = ky;
    // }

    const records = await TongHopLaoDong.find(query).populate('user', 'username khoa');

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


