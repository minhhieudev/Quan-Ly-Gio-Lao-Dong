import { connectToDB } from '@mongodb';
import TongHopLaoDong from "@models/TongHopLaoDong";
import Khoa from "@models/Khoa";
import User from "@models/User";

export const GET = async (req) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const namHoc = searchParams.get('namHoc');

    // Debug logs
    console.log('1. Starting query with namHoc:', namHoc);

    // Check if there's any data in TongHopLaoDong
    const checkTongHop = await TongHopLaoDong.findOne({ namHoc });
    console.log('2. TongHopLaoDong sample:', checkTongHop);

    // Check if there's any data in Khoa
    const checkKhoa = await Khoa.findOne({});
    console.log('3. Khoa sample:', checkKhoa);

    const result = await Khoa.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "maKhoa",
          foreignField: "maKhoa",
          as: "usersInKhoa",
        },
      },
      {
        $lookup: {
          from: "tonghoplaodongs",
          let: { 
            usersIds: "$usersInKhoa._id", 
            namHoc: namHoc,
            loai: "chinh-quy" // Add this to filter for chinh-quy only
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$namHoc", "$$namHoc"] },
                    { $eq: ["$loai", "$$loai"] },
                    { $in: ["$user", "$$usersIds"] }
                  ]
                }
              }
            },
            {
              $project: {
                user: 1,
                tongGioChinhQuy: {
                  $add: [
                    { $ifNull: [{ $sum: ["$congTacGiangDay.tong"] }, 0] },
                    { $ifNull: [{ $sum: ["$congTacKhac.tong"] }, 0] }
                  ]
                }
              }
            }
          ],
          as: "completedUsersData"
        }
      },
      // Debug stage for tonghoplaodongs lookup
      {
        $addFields: {
          debugStage2: {
            completedCount: { $size: "$completedUsersData" },
            firstCompleted: { $arrayElemAt: ["$completedUsersData", 0] }
          }
        }
      },
      {
        $addFields: {
          totalUsers: { $size: "$usersInKhoa" }, // Tổng số user trong khoa
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
                              cond: { $eq: ["$$data.user", "$$user._id"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ["$$userData.tongGioChinhQuy", 0] }
                  }
                }
              }
            }
          }
        }
      },
    ]);

    console.log('4. Aggregation result first item:', JSON.stringify(result[0], null, 2));
    console.log('5. Debug stages:', JSON.stringify({
      stage1: result[0]?.debugStage1,
      stage2: result[0]?.debugStage2
    }, null, 2));

    // Log kết quả để debug
    console.log('First result:', JSON.stringify(result[0]?.debug, null, 2));

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
    console.error("Detailed error:", {
      message: err.message,
      stack: err.stack
    });
    return new Response(JSON.stringify({ message: `Lỗi: ${err.message}` }), { status: 500 });
  }
};
