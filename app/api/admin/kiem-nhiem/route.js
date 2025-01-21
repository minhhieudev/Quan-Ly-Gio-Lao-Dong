import PhanCongKiemNhiem from "@models/PhanCongKiemNhiem";
import { connectToDB } from "@mongodb";

export const GET = async (req) => {
  try {
    await connectToDB();

    // Lấy các tham số từ query
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || ''; // Tham số tìm kiếm
    const khoa = searchParams.get('khoa') || ''; // Tham số tìm kiếm
    const page = parseInt(searchParams.get('page')) || 1; // Tham số trang, mặc định là 1
    const pageSize = parseInt(searchParams.get('pageSize')) || 10; // Kích thước trang, mặc định là 10
    console.log('Khoa:', khoa)

    if (search !== '' && khoa !== ''&& khoa !== 'undefined') {
      // Lấy dữ liệu mà không có điều kiện tìm kiếm
      const dataAll = await PhanCongKiemNhiem.find()
        .populate('chucVu', 'tenCV')
        .populate('user', 'username khoa')
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      // Lọc dữ liệu sau khi đã populate
      const data = search
        ? dataAll.filter(item =>
          (item.chucVu.tenCV.toLowerCase().includes(search.toLowerCase()) ||
            item.user.username.toLowerCase().includes(search.toLowerCase())) &&
          item?.user?.khoa?.toLowerCase().includes(khoa.toLowerCase())
        )
        : dataAll;
      const totalCount = data.length;
      return new Response(JSON.stringify({ data, totalCount }), { status: 200 });
    }

    if (khoa !== '' && khoa !== 'undefined') {
      // Lấy dữ liệu mà không có điều kiện tìm kiếm
      const dataAll = await PhanCongKiemNhiem.find()
        .populate('chucVu', 'tenCV') // Populate trường chucVu
        .populate('user', 'username khoa') // Populate trường user
        .skip((page - 1) * pageSize) // Bỏ qua số lượng bản ghi theo trang
        .limit(pageSize); // Giới hạn số lượng bản ghi trên mỗi trang

      // Lọc dữ liệu sau khi đã populate
      const data = khoa
        ? dataAll.filter(item =>
          item.user && item.user.khoa && item.user.khoa.toLowerCase().includes(khoa.toLowerCase()) 
        )
        : dataAll;
      const totalCount = data.length;

      return new Response(JSON.stringify({ data, totalCount }), { status: 200 });
    }

    if (search !== '') {
      // Lấy dữ liệu mà không có điều kiện tìm kiếm
      const dataAll = await PhanCongKiemNhiem.find()
        .populate('chucVu', 'tenCV') // Populate trường chucVu
        .populate('user', 'username') // Populate trường user
        .skip((page - 1) * pageSize) // Bỏ qua số lượng bản ghi theo trang
        .limit(pageSize); // Giới hạn số lượng bản ghi trên mỗi trang

      // Lọc dữ liệu sau khi đã populate
      const data = search
        ? dataAll.filter(item =>
          item.chucVu.tenCV.toLowerCase().includes(search.toLowerCase()) ||
          item.user.username.toLowerCase().includes(search.toLowerCase())
        )
        : dataAll;
      const totalCount = data.length;

      return new Response(JSON.stringify({ data, totalCount }), { status: 200 });
    }

    // Tạo điều kiện tìm kiếm
    const filter = {};

    // Lấy dữ liệu với điều kiện tìm kiếm và phân trang
    const data = await PhanCongKiemNhiem.find(filter)
      .populate('chucVu', 'tenCV') // Populate trường chucVu
      .populate('user', 'username') // Populate trường user
      .skip((page - 1) * pageSize) // Bỏ qua số lượng bản ghi theo trang
      .limit(pageSize); // Giới hạn số lượng bản ghi trên mỗi trang

    // Lấy tổng số bản ghi để tính toán phân trang
    const totalCount = await PhanCongKiemNhiem.countDocuments(filter);

    return new Response(JSON.stringify({ data, totalCount }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all PhanCongKiemNhiem", { status: 500 });
  }
};

// POST (Create new department)
export const POST = async (req, res) => {
  try {
    await connectToDB();
    const { chucVu, startTime, endTime, user, ghiChu } = await req.json();

    let existing = await PhanCongKiemNhiem.findOne({ user, chucVu });

    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.ghiChu = ghiChu;
      await existing.save();

      return new Response(JSON.stringify(existing), { status: 200 });
    } else {
      const newCV = new PhanCongKiemNhiem({
        chucVu,
        startTime,
        endTime,
        user,
        ghiChu
      });

      await newCV.save();
      return new Response(JSON.stringify(newCV), { status: 201 });
    }
  } catch (err) {
    console.log(err);
    return new Response("Failed to create or update phan cong kiem nhiem", { status: 500 });
  }
};

// PUT (Update existing department)
export const PUT = async (req, res) => {
  try {
    await connectToDB();
    const { id, chucVu, startTime, endTime, user, ghiChu } = await req.json();
    const Update = await PhanCongKiemNhiem.findById(id);

    if (!Update) {
      return new Response("Chuc vu not found", { status: 404 });
    }

    Update.chucVu = chucVu;
    Update.startTime = startTime;
    Update.endTime = endTime;
    Update.user = user;
    Update.ghiChu = ghiChu;

    await Update.save();

    return new Response(JSON.stringify(Update), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to update chuc vu", { status: 500 });
  }
};

// DELETE (Delete department)
export const DELETE = async (req, res) => {
  try {
    await connectToDB();
    const { id } = await req.json();

    // Tìm và xóa khoa
    const Delete = await PhanCongKiemNhiem.findByIdAndDelete(id);

    if (!Delete) {
      return new Response("Chuc Vu not found", { status: 404 });
    }

    return new Response("Xóa thành công", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to delete department", { status: 500 });
  }
};
