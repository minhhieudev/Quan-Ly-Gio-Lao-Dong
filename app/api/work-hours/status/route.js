import { connectToDB } from '@mongodb';
import TongHopLaoDong from '@models/TongHopLaoDong';

export async function GET(req) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const namHoc = searchParams.get('namHoc');
    const loai = searchParams.get('loai');
    
    if (!userId || !namHoc || !loai) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
    }
    
    const record = await TongHopLaoDong.findOne({
      user: userId,
      namHoc,
      loai
    });
    
    if (!record) {
      return new Response(JSON.stringify({ trangThai: 0 }), { status: 200 });
    }
    
    return new Response(JSON.stringify({ trangThai: record.trangThai }), { status: 200 });
  } catch (error) {
    console.error("Error fetching status:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}