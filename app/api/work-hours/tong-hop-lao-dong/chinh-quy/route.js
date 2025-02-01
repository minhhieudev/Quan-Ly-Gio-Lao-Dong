import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import TongHopLaoDong from "@models/TongHopLaoDong";

export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();

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

    const newRecord = await TongHopLaoDong.create(data);
    return new Response(JSON.stringify(newRecord), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to create new record`, { status: 500 });
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

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    
    const records = await TongHopLaoDong.find({
      loai: type,
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).populate('user', 'username'); 

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


