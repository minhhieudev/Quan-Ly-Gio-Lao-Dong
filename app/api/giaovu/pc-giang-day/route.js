export const dynamic = 'force-dynamic';

import { connectToDB } from '@mongodb';
import PcGiangDay from "@models/PcGiangDay";


// GET - Lấy danh sách phân công giảng dạy theo năm học và kì học
export const GET = async (req) => {
  try {
    await connectToDB();
    
    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');
    const ky = searchParams.get('kiHoc');

    // Tạo đối tượng điều kiện tìm kiếm
    let filter = {};
    
    // Nếu có tham số namHoc, thêm vào điều kiện tìm kiếm
    if (namHoc) {
      filter.namHoc = namHoc;
    }

    // Nếu có tham số ky, thêm vào điều kiện tìm kiếm
    if (ky) {
      filter.ky = ky;
    }

  

    // Nếu không có cả namHoc lẫn ky thì trả về lỗi
    if (!namHoc && !ky) {
      return new Response("Thiếu tham số namHoc hoặc kiHoc.", { status: 400 });
    }

    // Tìm kiếm các bản ghi phân công giảng dạy theo điều kiện filter
    const pcGiangDays = await PcGiangDay.find(filter);

    // Trả về phản hồi thành công
    return new Response(JSON.stringify(pcGiangDays), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error fetching PcGiangDay:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};



export const POST = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();
    
    // Lấy dữ liệu từ request
    const data = await req.json();
    
    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!data.maMH || !data.tenMH || !data.namHoc || !data.gvGiangDay) {
      return new Response("Dữ liệu không hợp lệ, vui lòng điền đầy đủ các trường bắt buộc.", { status: 400 });
    }

    // Điều kiện để tìm kiếm bản ghi
    const condition = {
      maMH: data.maMH,
      tenMH: data.tenMH,
      gvGiangDay: data.gvGiangDay,
      thu: data.thu || '',
      tietBD: data.tietBD || 0,
      namHoc: data.namHoc,
      ky: data.ky
    };

    // Tìm kiếm bản ghi dựa trên điều kiện
    const existingRecord = await PcGiangDay.findOne(condition);

    if (existingRecord) {
      // Nếu tìm thấy bản ghi, cập nhật nó
      existingRecord.soTC = data.soTC || existingRecord.soTC;
      existingRecord.soSVDK = data.soSVDK || existingRecord.soSVDK;
      existingRecord.nhom = data.nhom || existingRecord.nhom;
      existingRecord.soTiet = data.soTiet || existingRecord.soTiet;
      existingRecord.phong = data.phong || existingRecord.phong;
      existingRecord.lop = data.lop || existingRecord.lop;

      existingRecord.hinhThucTH = data.hinhThucTH || existingRecord.hinhThucTH;
      existingRecord.boMon = data.boMon || existingRecord.boMon;
      existingRecord.nganh = data.nganh || existingRecord.nganh;
      existingRecord.khoa = data.khoa || existingRecord.khoa;

      // Lưu bản ghi đã cập nhật
      await existingRecord.save();

      // Trả về phản hồi thành công
      return new Response(JSON.stringify(existingRecord), { status: 200 });
    } else {
      // Nếu không tìm thấy bản ghi, tạo mới một bản ghi
      const newPcGiangDay = new PcGiangDay({
        maMH: data.maMH,
        tenMH: data.tenMH,
        soTC: data.soTC || 0,
        soSVDK: data.soSVDK || 0,
        gvGiangDay: data.gvGiangDay,
        nhom: data.nhom || 0,
        thu: data.thu || '',
        tietBD: data.tietBD || 0,
        soTiet: data.soTiet || 0,
        phong: data.phong || '',
        lop: data.lop || '',
        namHoc: data.namHoc,
        ky: data.ky,
        tuanHoc: data.tuanHoc || "",

        hinhThucTH: data.hinhThucTH || "",
        boMon: data.boMon || "",
        nganh: data.nganh || "",
        khoa: data.khoa || "",
      });

      // Lưu bản ghi mới vào database
      await newPcGiangDay.save();

      // Trả về phản hồi thành công
      return new Response(JSON.stringify(newPcGiangDay), { status: 201 });
    }
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error saving PcGiangDay:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};


// PUT - Cập nhật bản ghi
export const PUT = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    // Lấy dữ liệu và ID từ request
    const { id, ...data } = await req.json();

    // Kiểm tra xem ID có tồn tại không
    if (!id) {
      return new Response("ID bản ghi không được cung cấp.", { status: 400 });
    }

    // Cập nhật bản ghi dựa trên ID
    const updatedPcGiangDay = await PcGiangDay.findByIdAndUpdate(id, data, { new: true });

    if (!updatedPcGiangDay) {
      return new Response("Không tìm thấy bản ghi để cập nhật.", { status: 404 });
    }

    // Trả về phản hồi thành công
    return new Response(JSON.stringify(updatedPcGiangDay), { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error updating PcGiangDay:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};

// DELETE - Xóa bản ghi
export const DELETE = async (req) => {
  try {
    // Kết nối tới MongoDB
    await connectToDB();

    // Lấy ID từ request body
    const { id } = await req.json();

    // Kiểm tra xem ID có tồn tại không
    if (!id) {
      return new Response("ID bản ghi không được cung cấp.", { status: 400 });
    }

    // Xóa bản ghi dựa trên ID
    const deletedPcGiangDay = await PcGiangDay.findByIdAndDelete(id);

    if (!deletedPcGiangDay) {
      return new Response("Không tìm thấy bản ghi để xóa.", { status: 404 });
    }

    // Trả về phản hồi thành công
    return new Response("Bản ghi đã được xóa thành công.", { status: 200 });
  } catch (err) {
    // Bắt lỗi và trả về phản hồi lỗi
    console.error("Error deleting PcGiangDay:", err);
    return new Response(`Lỗi: ${err.message}`, { status: 500 });
  }
};
