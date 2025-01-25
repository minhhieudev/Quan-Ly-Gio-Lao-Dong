import { connectToDB } from "@mongodb";
import CongTacGiangDay from "@models/CongTacGiangDay";
import CongTacChamThi from "@models/CongTacChamThi";
import CongTacCoiThi from "@models/CongTacCoiThi";
import CongTacHuongDan from "@models/CongTacHuongDan";
import CongTacKiemNhiem from "@models/CongTacKiemNhiem";
import CongTacRaDe from "@models/CongTacRaDe";
import User from "@models/User";
import MaNgach from "@models/MaNgach";
import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";

export const GET = async (request) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const type = searchParams.get('type');
    const namHoc = searchParams.get('namHoc');
    const ky = searchParams.get('ky');

    let info = {}

    // Lấy thông tin user
    const userInfo = await User.findById(user);

    if (userInfo) {
      info.userInfo = userInfo
      // Lấy thông tin ngạch cho người dùng
      const maNgachInfo = await MaNgach.findOne({ maNgach: userInfo.maNgach });
      info.maNgachInfo = maNgachInfo

      const kiemNhiemInfo = await PhanCongKiemNhiem.find({ user: userInfo._id }).populate('chucVu', 'tenCV');
      info.kiemNhiemInfo = kiemNhiemInfo.map(info => info.chucVu.tenCV);

      console.log(kiemNhiemInfo)

    }

    // Lấy dữ liệu từ tất cả các collection
    const [
      giangDay,
      chamThi,
      coiThi,
      huongDan,
      kiemNhiem,
      raDe
    ] = await Promise.all([
      CongTacGiangDay.find({ user, type, namHoc, ky }).populate('user'),
      CongTacChamThi.find({ user, type, namHoc, ky }).populate('user'),
      CongTacCoiThi.find({ user, type, namHoc, ky }).populate('user'),
      CongTacHuongDan.find({ user, type, namHoc, ky }).populate('user'),
      CongTacKiemNhiem.find({ user, type, namHoc }).populate('user'),
      CongTacRaDe.find({ user, type, namHoc, ky }).populate('user')
    ]);

    const responseData = {
      info: info,
      data: {
        CongTacGiangDay: giangDay,
        CongTacChamThi: chamThi,
        CongTacCoiThi: coiThi,
        CongTacHuongDan: huongDan,
        CongTacKiemNhiem: kiemNhiem,
        CongTacRaDe: raDe
      }
    };
    console.log(responseData)

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all data", { status: 500 });
  }
};