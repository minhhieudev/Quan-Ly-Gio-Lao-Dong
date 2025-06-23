import { connectToDB } from '@mongodb';
import TongHopLaoDong from "@models/TongHopLaoDong";
import Khoa from "@models/Khoa";
import User from "@models/User";

export const GET = async (req) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');

    // Lấy tất cả các khoa và xử lý với aggregation
    const result = await Khoa.aggregate([
      {
        $lookup: {
          from: "users", // Bảng User
          localField: "tenKhoa", // Tên khoa từ Khoa
          foreignField: "khoa", // Tên khoa trong User
          as: "usersInKhoa", // Kết hợp danh sách user theo khoa
        },
      },
      {
        $addFields: {
          totalUsers: { $size: "$usersInKhoa" }, // Tổng số user trong khoa
        },
      },
      {
        $lookup: {
          from: "tonghoplaodongs", // Bảng TongHopLaoDong
          let: { usersIds: "$usersInKhoa._id", namHoc },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$namHoc", "$$namHoc"] },
                    { $in: ["$user", "$$usersIds"] },
                  ],
                },
              },
            },
          ],
          as: "completedUsersData", // Danh sách giảng viên đã nộp trong khoa
        },
      },
      {
        $addFields: {
          completedUsers: { $size: "$completedUsersData" }, // Số lượng giảng viên đã nộp
        },
      },
      {
        $project: {
          tenKhoa: 1,
          totalUsers: 1,
          completedUsers: 1,
          listGV: {
            $map: {
              input: "$usersInKhoa",
              as: "user",
              in: {
                username: "$$user.username",
                tongGioChinhQuy: {
                  $let: {
                    vars: {
                      userData: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$completedUsersData",
                              as: "data",
                              cond: { $eq: ["$$data.user", "$$user._id"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$userData.tongGioChinhQuy", 0] },
                  }
                }
              },
            },
          },
        },
      },
    ]);

    // Định dạng lại kết quả trả về
    const formattedResult = result.reduce((acc, khoa) => {
      acc[khoa.tenKhoa] = {
        current: khoa.completedUsers,
        total: khoa.totalUsers,
        listGV: khoa.listGV,
      };
      return acc;
    }, {});

    return new Response(JSON.stringify(formattedResult), { status: 200 });

  } catch (err) {
    console.error("Lỗi khi lấy thống kê:", err);
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
