import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import BoiDuong from "@models/BoiDuong";

export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();

    const newRecord = await BoiDuong.create(body);
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
    await BoiDuong.findByIdAndDelete(id);
    return new Response(`$Deleted successfully`, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to delete record`, { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    await connectToDB();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const records = await BoiDuong.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).populate('user', 'username');

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


