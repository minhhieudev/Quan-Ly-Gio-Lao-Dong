export const dynamic = 'force-dynamic';

import mongoose from "mongoose";
import { connectToDB } from "@mongodb";
import CongTacGiangDay from "@models/CongTacGiangDay";
import BoiDuong from "@models/BoiDuong";
import CongTacChamThi from "@models/CongTacChamThi";
import CongTacCoiThi from "@models/CongTacCoiThi";
import CongTacHuongDan from "@models/CongTacHuongDan";
import CongTacKiemNhiem from "@models/CongTacKiemNhiem";
import CongTacRaDe from "@models/CongTacRaDe";

const models = {
  CongTacGiangDay,
  BoiDuong,
  CongTacChamThi,
  CongTacCoiThi,
  CongTacHuongDan,
  CongTacKiemNhiem,
  CongTacRaDe,
};

export const POST = async (req, { params }) => {
  console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')

  try {
    const { form } = params;
    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const body = await req.json();

    const model = models[form];
    const newRecord = await model.create(body);
    return new Response(JSON.stringify(newRecord), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to create new ${form} record`, { status: 500 });
  }
};

export const PUT = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const body = await req.json();
    const { id, ...updateData } = body;
    const model = models[form];
    const updatedRecord = await model.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(updatedRecord), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to update ${form} record`, { status: 500 });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const { id } = await req.json();
    const model = models[form];
    await model.findByIdAndDelete(id);
    return new Response(`${form} record deleted successfully`, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to delete ${form} record`, { status: 500 });
  }
};

export const GET = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const user = url.searchParams.get('user');
    const type1 = url.searchParams.get('type');
    const namHoc = url.searchParams.get('namHoc');
    const ky = url.searchParams.get('ky');
    let type = ''


    console.log("User:", user);

    if (!user) {
      return new Response("User and type parameters are required", { status: 400 });
    }

    const query = {
      user,
      type
    };

    if (namHoc) {
      query.namHoc = namHoc;
    }

    if (ky) {
      query.ky = ky;
    }

    if (type1) {
      query.type = type1;
    }

    console.log("Query:111111111111111", query);
    console.log('formformformform', form)

    const records = await models[form].find(query).populate('user', 'username');

    console.log('recordsrecordsrecords', records)

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve ${form} records`, { status: 500 });
  }
};

