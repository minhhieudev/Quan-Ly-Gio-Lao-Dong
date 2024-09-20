import * as XLSX from 'xlsx';

export const exportToExcelTongHop = (dataList, type, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const isChinhQuy = type === "chinh-quy" ? true : false

  const ws = isChinhQuy ?
    XLSX.utils.aoa_to_sheet([
      ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
      ["KHOA………………………………", "", "", "", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
      [],
      ["", "", "", "", "", `${title}`,],
      ["", "", "", "", "", "", "", "Năm học:............",],
      [],
      [
        "      TT", "Họ và tên giảng viên",
        { v: "          Công tác giảng dạy chính quy", s: { alignment: { horizontal: "center" } } },
        null, null, null,
        "Tổng giảng dạy", "Giờ chuẩn", "Kiêm nhiệm", "Chuẩn năm học",
        { v: "                                 Công tác khác", s: { alignment: { horizontal: "center" } } },
        null, null, null, null,
        "Tổng giờ chính quy", "Thừa/Thiếu giờ lao động"
      ],
      [
        null, null,
        "         Số tiết", null, "  Số tiết quy chuẩn", null, null,
        null, null, null,
        " Chấm thi", " Ngoại khóa", "  Coi thi", "   Đề thi", "    Tổng",
        null, null
      ],
      [
        null, null,
        "      LT", "      TH", "      LT", "      TH",
        null, null, null, null,
        null, null, null, null,
        null, null
      ],
    ])
    : XLSX.utils.aoa_to_sheet([
      ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
      ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
      [],
      ["", "", "", `${title}`,],
      ["", "", "", "", "", "Năm học: ............",],
      [],
      [
        "      TT", "Họ và tên giảng viên",
        { v: "          Công tác giảng dạy chính quy", s: { alignment: { horizontal: "center" } } },
        null, null, null,
        "Tổng giảng dạy",
        { v: "                                 Công tác khác", s: { alignment: { horizontal: "center" } } },
        null, null, null, null,
        "Tổng giờ ", "Ghi chú"
      ],
      [
        null, null,
        "         Số tiết", null, "  Số tiết quy chuẩn", null, null,

        " Chấm thi", " Ngoại khóa", "  Coi thi", "   Đề thi", "    Tổng",
        null, null
      ],
      [
        null, null,
        "      LT", "      TH", "      LT", "      TH",
        null, null, null, null,
        null, null, null, null,
        null, null
      ],
    ]);

  ws["!merges"] = isChinhQuy ? [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………

    { s: { r: 6, c: 2 }, e: { r: 6, c: 5 } }, // Công tác giảng dạy chính quy (Số tiết)
    { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } }, // Công tác giảng dạy chính quy (Số tiết quy chuẩn)
    { s: { r: 6, c: 10 }, e: { r: 6, c: 14 } }, // Công tác khác
    { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }, // Công tác giảng dạy chính quy (Số tiết)

    { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } }, // Công tác giảng dạy chính quy (Số tiết)

    { s: { r: 6, c: 0 }, e: { r: 8, c: 0 } },
    { s: { r: 6, c: 1 }, e: { r: 8, c: 1 } },

    // Cột tổng giảng dạy
    { s: { r: 6, c: 6 }, e: { r: 8, c: 6 } },
    { s: { r: 6, c: 7 }, e: { r: 8, c: 7 } },
    { s: { r: 6, c: 8 }, e: { r: 8, c: 8 } },
    { s: { r: 6, c: 9 }, e: { r: 8, c: 9 } },

    // Cột công tác khác
    { s: { r: 7, c: 10 }, e: { r: 8, c: 10 } },
    { s: { r: 7, c: 11 }, e: { r: 8, c: 11 } },
    { s: { r: 7, c: 12 }, e: { r: 8, c: 12 } },
    { s: { r: 7, c: 13 }, e: { r: 8, c: 13 } },
    { s: { r: 7, c: 14 }, e: { r: 8, c: 14 } },

    // 2 cột cuối
    { s: { r: 6, c: 15 }, e: { r: 8, c: 15 } },
    { s: { r: 6, c: 16 }, e: { r: 8, c: 16 } }, //Ghi chú
  ] :
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………
      // { s: { r: 3, c: 1 }, e: { r: 3, c: 6 } }, // BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ CHÍNH QUY
      // { s: { r: 4, c: 1 }, e: { r: 4, c: 6 } }, // Năm học: 2023 - 2024
      { s: { r: 6, c: 2 }, e: { r: 6, c: 5 } }, // Công tác giảng dạy chính quy (Số tiết)
      { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } }, // Công tác giảng dạy chính quy (Số tiết quy chuẩn)
      { s: { r: 6, c: 7 }, e: { r: 6, c: 11 } }, // Công tác khác
      { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }, // Công tác giảng dạy chính quy (Số tiết)

      // 2 cột đầu
      { s: { r: 6, c: 0 }, e: { r: 8, c: 0 } },
      { s: { r: 6, c: 1 }, e: { r: 8, c: 1 } },

      { s: { r: 6, c: 6 }, e: { r: 8, c: 6 } },

      { s: { r: 7, c: 7 }, e: { r: 8, c: 7 } },
      { s: { r: 7, c: 8 }, e: { r: 8, c: 8 } },
      { s: { r: 7, c: 9 }, e: { r: 8, c: 9 } },
      { s: { r: 7, c: 10 }, e: { r: 8, c: 10 } },
      { s: { r: 7, c: 11 }, e: { r: 8, c: 11 } },

      { s: { r: 6, c: 12 }, e: { r: 8, c: 12 } },
      { s: { r: 6, c: 13 }, e: { r: 8, c: 13 } },
    ];

  // Add data to the worksheet
  {
    isChinhQuy ? dataList.forEach((data, index) => {
      const row = [
        index + 1,
        data.user.username,
        data.congTacGiangDay.soTietLT,
        data.congTacGiangDay.soTietTH,
        data.congTacGiangDay.soTietQCLT,
        data.congTacGiangDay.soTietQCTH,
        data.congTacGiangDay.tong,
        data.gioChuan,
        data.kiemNhiem,
        data.chuanNamHoc,
        data.congTacKhac.chamThi,
        data.congTacKhac.ngoaiKhoa,
        data.congTacKhac.coiThi,
        data.congTacKhac.deThi,
        data.congTacKhac.tong,
        data.tongGioChinhQuy,
        data.thuaThieuGioLaoDong,
      ];
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
    }) :
      dataList.forEach((data, index) => {
        const row = [
          index + 1,
          data.user.username,
          data.congTacGiangDay.soTietLT,
          data.congTacGiangDay.soTietTH,
          data.congTacGiangDay.soTietQCLT,
          data.congTacGiangDay.soTietQCTH,
          data.congTacGiangDay.tong,
          data.congTacKhac.chamThi,
          data.congTacKhac.ngoaiKhoa,
          data.congTacKhac.coiThi,
          data.congTacKhac.deThi,
          data.congTacKhac.tong,
          data.tongGioChinhQuy,
          data.ghiChu,
        ];
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
      });
  }
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};

export const exportToExcelTongHopBoiDuong = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Chuyên đề giảng dạy", "Lớp giảng dạy", "Số HV",
      "         Số tiết", null,
      "Số tiết quy chuẩn", "Tổng cộng", "Ghi chú"
    ],
    [
      null, null, null, null, null,
      "      LT", "      TH",
      null, null, null, null,
      null, null, null, null,
      null, null
    ],
  ])


  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………
    // { s: { r: 3, c: 1 }, e: { r: 3, c: 6 } }, // BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ CHÍNH QUY
    // { s: { r: 4, c: 1 }, e: { r: 4, c: 6 } }, // Năm học: 2023 - 2024
    { s: { r: 6, c: 5 }, e: { r: 6, c: 6 } },

    { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } },
    { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } },

    { s: { r: 6, c: 2 }, e: { r: 7, c: 2 } },
    { s: { r: 6, c: 3 }, e: { r: 7, c: 3 } },
    { s: { r: 6, c: 4 }, e: { r: 7, c: 4 } },

    { s: { r: 6, c: 7 }, e: { r: 7, c: 7 } },
    { s: { r: 6, c: 8 }, e: { r: 7, c: 8 } },
    { s: { r: 6, c: 9 }, e: { r: 7, c: 9 } },

  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.chuyenDe,
      data.lopGiangDay,
      data.SoHV,
      data.soTietLT,
      data.soTietLT,
      data.soTietQuyChuan,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};

export const exportToExcelChiTiet = (dataList, id, title) => {
  switch (id) {
    case 'CongTacGiangDay':
      exportToExcelGiangDay(dataList, title)
    case 'CongTacChamThi':
      exportToExcelChamThi(dataList, title)
    case 'CongTacHuongDan':
      exportToExcelHuongDan(dataList, title)
    case 'CongTacCoiThi':
      exportToExcelCoiThi(dataList, title)
    case 'CongTacRaDe':
      exportToExcelRaDe(dataList, title)
    case 'CongTacKiemNhiem':
      exportToExcelKiemNhiem(dataList, title)
    default:
      return '';
  }
}

const exportToExcelChamThi = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Học phần chấm thi", "Học kỳ", "Cán bộ chấm thi", "Lớp học phần", "Số bài chấm",
      "Số tiết quy chuẩn", "Tổng cộng", "Ghi chú"
    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………

  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.hocPhan,
      data.lopHocPhan,
      data.ky,
      data.canBoChamThi,
      data.soBaiCham,
      data.soTietQuyChuan,
      data.soTietQuyChuan,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};
const exportToExcelHuongDan = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Nội dung công việc", "Số SV/Số nhóm", "Lớp học phần", "Thời gian", "Số buổi",
      "Số tiết quy chuẩn", "Ghi chú"
    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………

  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.hocPhan,
      data.noiDungCongViec,
      data.soSVSoNhom,
      data.lopHocPhan,
      data.thoiGian,
      data.soBuoi,
      data.soTietQuyChuan,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};
const exportToExcelKiemNhiem = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Chức vụ, công việc", "Thời gian tính", "Tỷ lệ % miễn giảm", "Số tiết quy chuẩn", "Ghi chú",
    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………
  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.chucVuCongViec,
      data.thoiGianTinh,
      data.tyLeMienGiam,
      data.soTietQC,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};
const exportToExcelRaDe = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Học phần", "Số TC", "Lớp học phần", "Học kỳ", "Hình thức thi",
      "Thời gian thi", "Số tiết quy chuẩn", "Ghi chú",
    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………
  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.hocPhan,
      data.soTC,
      data.lopHocPhan,
      data.hocKy,
      data.hinhThucThi,
      data.thoiGianThi,
      data.soTietQuyChuan,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};
const exportToExcelCoiThi = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Học kỳ", "Học phần", "Thời gian thi", "Ngày thi", "Số tiết quy chuẩn", "Ghi chú"

    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………
  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.ky,
      data.hocPhan,
      data.thoiGianThi,
      data.ngayThi,
      data.soTietQuyChuan,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};
const exportToExcelGiangDay = (dataList, title) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
    ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
    [],
    ["", "", "", `${title}`,],
    ["", "", "", "", "", "Năm học:.........",],
    [],
    [
      "      TT", "Họ và tên giảng viên", "Học phần", "Học kỳ", "Số TC", "Lớp học phần", "Số SV",
      "         Số tiết", null,
      "Số tiết quy chuẩn", null, "Tổng cộng", "Ghi chú"
    ],
    [
      null, null, null, null, null, null, null,
      "      LT", "      TH", "      LT", "      TH",
      null, null, null, null,
      null, null, null, null,
      null, null
    ],
  ])

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………

    { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } },
    { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } },

    { s: { r: 6, c: 2 }, e: { r: 7, c: 2 } },
    { s: { r: 6, c: 3 }, e: { r: 7, c: 3 } },
    { s: { r: 6, c: 4 }, e: { r: 7, c: 4 } },
    { s: { r: 6, c: 5 }, e: { r: 7, c: 5 } },
    { s: { r: 6, c: 6 }, e: { r: 7, c: 6 } },

  ]

  // Add data to the worksheet
  dataList.forEach((data, index) => {
    const row = [
      index + 1,
      data.user.username,
      data.hocPhan,
      data.ky,
      data.soTinChi,
      data.lopHocPhan,
      data.soSV,
      data.soTietLT,
      data.soTietLT,
      data.soTietQCLT,
      data.soTietQCTH,
      data.tongCong,
      data.ghiChu,
    ];
    XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
  })
  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

  // Export the workbook to a file
  XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
};

// Dự định làm chi tiết bồi dưỡng với các cột khác
// export const exportToExcelBoiDuong = (dataList,title) => {
//   if (!dataList || dataList.length === 0) {
//     console.error("No data available to export");
//     return;
//   }

//   const ws = XLSX.utils.aoa_to_sheet([
//     ["TRƯỜNG ĐẠI HỌC PHÚ YÊN", "", "", "", "", "", "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",],
//     ["KHOA………………………………", "", "", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"],
//     [],
//     ["", "", "", `${title}`,],
//     ["", "", "", "", "", "Năm học:.........",],
//     [],
//     [
//       "      TT", "Họ và tên giảng viên", "Chuyên đề giảng dạy", "Loại hình bồi dưỡng", "Thời gian (đợt / năm)", "Số HV",
//       "         Số tiết", null,
//       "Số tiết quy chuẩn", "Ghi chú"
//     ],
//     [
//       null, null, null, null, null, null, null,
//       "      LT", "      TH",
//       null, null, null, null,
//       null, null, null, null,
//       null, null
//     ],
//   ])

//   ws["!merges"] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // TRƯỜNG ĐẠI HỌC PHÚ YÊN
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // HOA………………………………

//     { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } },
//     { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } },

//     { s: { r: 6, c: 2 }, e: { r: 7, c: 2 } },
//     { s: { r: 6, c: 3 }, e: { r: 7, c: 3 } },
//     { s: { r: 6, c: 4 }, e: { r: 7, c: 4 } },
//     { s: { r: 6, c: 5 }, e: { r: 7, c: 5 } },
//     { s: { r: 6, c: 6 }, e: { r: 7, c: 6 } },

//   ]

//   // Add data to the worksheet
//   dataList.forEach((data, index) => {
//     const row = [
//       index + 1,
//       data.user.username,
//       data.chuyenDe,
//       data.loaiHinh,
//       data.thoiGian,
//       data.soHV,
//       data.soTietLT,
//       data.soTietTH,
//       data.soTietQuyChuan,
//       data.ghiChu,
//     ];
//     XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
//   })
//   // Create a new workbook and add the worksheet
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Bảng tổng hợp");

//   // Export the workbook to a file
//   XLSX.writeFile(wb, "Bang_Tong_Hop_Lao_Dong_Giang_Vien.xlsx");
// };