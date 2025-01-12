import ChucVu from "@models/ChucVu";
import { connectToDB } from "@mongodb";

export const POST = async (req) => {
  try {
    await connectToDB();

    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ message: "Invalid data format" }), { status: 400 });
    }

    const processed= await Promise.all(
      data.map(async (item) => {
        const maCV = item[0];
        const updated= await ChucVu.findOneAndUpdate(
          { maCV },
          {
             tenCV : item[1],
             loaiCV : item[2],
             soMien : item[3],
           
          },
          { new: true, upsert: true } 
        );

        return updated;
      })
    );

    return new Response(JSON.stringify(processed), { status: 201 });

  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu:", err);
    return new Response(JSON.stringify({ message: "Failed to process import ngach" }), { status: 500 });
  }
};
