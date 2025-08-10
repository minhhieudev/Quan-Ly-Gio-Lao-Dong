export const dynamic = 'force-dynamic';

import { connectToDB } from "@mongodb";
import CongTacGiangDay from "@models/CongTacGiangDay";
import CongTacChamThi from "@models/CongTacChamThi";
import CongTacCoiThi from "@models/CongTacCoiThi";
import CongTacHuongDan from "@models/CongTacHuongDan";
import CongTacKiemNhiem from "@models/CongTacKiemNhiem";
import CongTacRaDe from "@models/CongTacRaDe";

const models = {
  CongTacGiangDay,
  CongTacChamThi,
  CongTacCoiThi,
  CongTacHuongDan,
  CongTacKiemNhiem,
  CongTacRaDe,
};
export const GET = async (req, { params }) => {
  try {
    const { form } = params;

    if (!models[form]) {
      return new Response("Invalid form name", { status: 400 });
    }

    await connectToDB();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const type = url.searchParams.get('type');
    const namHoc = url.searchParams.get('namHoc');
    const kiHoc = url.searchParams.get('kiHoc');

    const model = models[form];

    let query = {
      type: type,
      namHoc: namHoc,
    };

    if (form !== 'CongTacKiemNhiem' && kiHoc !== 'undefined' && kiHoc !== '') {
      query.ky = kiHoc;
    }
    const records = await model.find(query).populate('user', 'username maKhoa');

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve ${form} records`, { status: 500 });
  }
};

