import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import BoiDuong from "@models/BoiDuong";

export const GET = async (req) => {
  try {
    await connectToDB();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    
    const records = await BoiDuong.find({
      loai: {form},
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).populate('user', 'username'); 

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


