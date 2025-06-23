export const dynamic = 'force-dynamic';

import { connectToDB } from "@mongodb";
import TongHopLaoDong from "@models/TongHopLaoDong";

export async function POST(request, { params }) {
  try {
    await connectToDB();
    const body = await request.json();
    const { user, congTacGiangDay, congTacKhac, kiemNhiem, loai, namHoc, trangThai } = body;
    const { type } = params;

    // Kiểm tra xem bản ghi đã tồn tại chưa
    const existingRecord = await TongHopLaoDong.findOne({ user, loai, namHoc });

    if (existingRecord) {
      // Nếu bản ghi đã tồn tại, cập nhật bản ghi
      const updatedRecord = await TongHopLaoDong.findByIdAndUpdate(
        existingRecord._id,
        {
          congTacGiangDay,
          congTacKhac,
          kiemNhiem,
          // Luôn cập nhật trạng thái về 0 (Chờ duyệt) khi giảng viên gửi lại
          trangThai: 0
        },
        { new: true }
      );
      return new Response(JSON.stringify(updatedRecord), { status: 200 });
    } else {
      // Nếu không tồn tại, tạo bản ghi mới
      const newRecord = await TongHopLaoDong.create({
        user,
        congTacGiangDay,
        congTacKhac,
        kiemNhiem,
        loai,
        namHoc,
        trangThai: 0 // Mặc định là Chờ duyệt
      });
      return new Response(JSON.stringify(newRecord), { status: 200 });
    }
  } catch (error) {
    return new Response("Lỗi khi lưu dữ liệu", { status: 500 });
  }
}

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

    // Lấy records và populate user để có maNgach
    const records = await TongHopLaoDong.find(query).populate('user', 'username khoa maNgach');

    // Import model MaNgach
    const MaNgach = (await import("@models/MaNgach")).default;

    // Thêm trường gioChuan cho từng record
    const recordsWithGioChuan = await Promise.all(records.map(async (record) => {
      let gioChuan = null;
      if (record.user && record.user.maNgach) {
        const maNgachDoc = await MaNgach.findOne({ maNgach: record.user.maNgach });
        if (maNgachDoc) {
          gioChuan = maNgachDoc.GCGD || 0;
        }
      }
      // Chuyển record sang object và thêm trường gioChuan
      const recordObj = record.toObject();
      recordObj.gioChuan = gioChuan;
      return recordObj;
    }));

    return new Response(JSON.stringify(recordsWithGioChuan), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(`Failed to retrieve records`, { status: 500 });
  }
};


