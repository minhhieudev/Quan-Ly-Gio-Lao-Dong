import TongHopLaoDong from '@/models/TongHopLaoDong';
import { connectToDB } from "@mongodb";


export async function PUT(request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { id, trangThai } = body;
    console.log(id, trangThai)

    if (!id || typeof trangThai !== 'number' || trangThai < 0 || trangThai > 3) {
      return new Response("Thiếu id hoặc trạng thái không hợp lệ", { status: 400 });
    }

    const updated = await TongHopLaoDong.findByIdAndUpdate(
      id,
      { trangThai },
      { new: true }
    );
    console.log('Updated:', updated);

    if (!updated) {
      return new Response("Không tìm thấy bản ghi", { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: updated }), { status: 200 });
  } catch (error) {
    return new Response("Lỗi cập nhật trạng thái", { status: 500 });
  }
}
