import ExcelJS from 'exceljs';

export const exportLichThi = async (dataList, title, hocKy, namHoc, loaiDaoTao) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  console.log(dataList)

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch thi');

  let loai = loaiDaoTao === 'Chính quy' ? 'CHÍNH QUY' : 'LIÊN THÔNG VỪA LÀM VỪA HỌC';

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
    { header: 'Tên học phần', key: 'hocPhan', width: 35 },
    { header: 'Hình thức thi', key: 'hinhThuc', width: 12 },
    { header: 'TC', key: 'tc', width: 8 },
    { header: 'Lớp đại diện', key: 'lop', width: 25 },
    { header: 'Ngày thi', key: 'ngayThi', width: 12 },
    { header: 'Buổi thi', key: 'ca', width: 10 },
    { header: 'Phòng thi', key: 'phong', width: 25 },
    { header: 'Thời gian', key: 'thoiGian', width: 10 },
    { header: 'Số lượng', key: 'soLuong', width: 10 }
  ];

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', ''],
    ['PHÒNG QUẢN LÝ CHẤT LƯỢNG', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', ''],
    [''],
    ['', '', '', `${title} ${loai}`, '', '', '', '', '', '', ''],
    ['', '', '', `HỌC KỲ ${hocKy}, NĂM HỌC ${namHoc}`, '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1');  // Trường
  worksheet.mergeCells('G1:K1');  // CHXHCN VN
  worksheet.mergeCells('A2:C2');  // Phòng QLCL
  worksheet.mergeCells('G2:K2');  // Độc lập
  worksheet.mergeCells('D4:J4');  // Title - Mở rộng từ D4:H4 thành D4:J4
  worksheet.mergeCells('D5:J5');  // Học kỳ, năm học - Mở rộng từ D5:H5 thành D5:J5

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      maHocPhan: data.maHocPhan.join(' | '),
      hocPhan: data.hocPhan.join(' | '),
      hinhThuc: data.hinhThuc.join(' | '),
      tc: data.tc.join(' | '),
      lop: data.lop.map(arr => arr.join(' - ')).join(' | '),
      ngayThi: data.ngayThi,
      ca: data.ca === '1' ? 'Sáng' : 'Chiều',
      phong: data.phong.join(" | "),
      thoiGian: data.thoiGian.join(' | '),
      soLuong: data.soLuong.join(' | ')
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4-5)
    if (rowNumber >= 4 && rowNumber <= 5) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 7)
    if (rowNumber === 7) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 7) {
      // Căn trái cho một số cột cụ thể
      const tenHPCell = row.getCell(3); // Tên học phần
      const lopCell = row.getCell(6);    // Lớp đại diện
      [tenHPCell, lopCell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Lich_Thi_HK${hocKy}_${namHoc.replace("-", "_")}_${loai}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportPCGD = async (dataList, hocKy, namHoc) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('TKB Giảng dạy');

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã học phần', key: 'maMH', width: 12 },
    { header: 'Tên học phần', key: 'tenMH', width: 30 },
    { header: 'Số SVĐK', key: 'soSVDK', width: 10 },
    { header: 'Họ tên cán bộ giảng dạy', key: 'gvGiangDay', width: 25 },
    { header: 'Nhóm', key: 'nhom', width: 8 },
    { header: 'Thứ', key: 'thu', width: 8 },
    { header: 'Tiết BĐ', key: 'tietBD', width: 8 },
    { header: 'Số tiết', key: 'soTiet', width: 8 },
    { header: 'Phòng', key: 'phong', width: 12 },
    { header: 'Lớp', key: 'lop', width: 22 },
    { header: 'Tuần học', key: 'tuanHoc', width: 25 },
    { header: 'Địa điểm', key: 'diaDiem', width: 15 }
  ];

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['UBND TỈNH PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', 'THỜI KHÓA BIỂU GIẢNG DẠY'],
    ['', '', '', `Học kỳ ${hocKy}, Năm học ${namHoc}`],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1'); // UBND
  worksheet.mergeCells('G1:M1'); // CHXHCN VN - Mở rộng merge từ G1:J1 thành G1:M1
  worksheet.mergeCells('A2:C2'); // Trường
  worksheet.mergeCells('G2:M2'); // Độc lập - Mở rộng merge từ G2:J2 thành G2:M2
  worksheet.mergeCells('D4:I4'); // Thời khóa biểu
  worksheet.mergeCells('D5:I5'); // Học kỳ, năm học

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      maMH: data.maMH,
      tenMH: data.tenMH,
      soSVDK: data.soSVDK,
      gvGiangDay: data.gvGiangDay,
      nhom: data.nhom,
      thu: data.thu,
      tietBD: data.tietBD,
      soTiet: data.soTiet,
      phong: data.phong,
      lop: data.lop,
      tuanHoc: data.tuanHoc,
      diaDiem: data.diaDiem
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4-5)
    if (rowNumber >= 4 && rowNumber <= 5) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 7)
    if (rowNumber === 7) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 7) {
      // Căn trái cho cột tên học phần và họ tên giảng viên
      const tenMHCell = row.getCell(3);
      const hoTenGVCell = row.getCell(5);
      [tenMHCell, hoTenGVCell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });
    }
  });

  // Xuất file cho browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TKB_GiangDay_HK${hocKy}_${namHoc.replace("-", "_")}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportChamThi = async (dataList, hocKy, namHoc, loaiKyThi, loai) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Phân công chấm thi');

  let loaiDaoTao = loai === 'Chính quy' ? 'CHÍNH QUY' : 'LIÊN THÔNG VỪA LÀM VỪA HỌC';

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Học phần', key: 'hocPhan', width: 35 },
    { header: 'Nhóm/Lớp', key: 'nhomLop', width: 15 },
    { header: 'Ngày thi', key: 'ngayThi', width: 12 },
    { header: 'Cán bộ coi thi 1', key: 'cb1', width: 25 },
    { header: 'Cán bộ coi thi 2', key: 'cb2', width: 25 },
    { header: 'Số bài', key: 'soBai', width: 8 },
    { header: 'HT', key: 'hinhThuc', width: 8 },
    { header: 'TG', key: 'thoiGian', width: 8 }
  ];

  // Chuẩn bị tiêu đề học kỳ
  const hocKyTitle = hocKy ? `HỌC KỲ ${hocKy}, NĂM HỌC ${namHoc}` : `NĂM HỌC ${namHoc}`;

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG QUẢN LÝ CHẤT LƯỢNG', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', `PHÂN CÔNG CHẤM THI ${loaiKyThi.toUpperCase()} - HỆ ${loaiDaoTao}`, '', '', '', '', ''],
    ['', '', '', hocKyTitle, '', '', '', '', ''],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN - Mở rộng từ G1:I1 thành G1:M1
  worksheet.mergeCells('A2:C2');     // Phòng QLCL
  worksheet.mergeCells('G2:M2');     // Độc lập - Mở rộng từ G2:I2 thành G2:M2
  worksheet.mergeCells('D4:H4');     // Title
  worksheet.mergeCells('D5:H5');     // Học kỳ, năm học

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      hocPhan: data.hocPhan,
      nhomLop: data.nhomLop,
      ngayThi: data.ngayThi,
      cb1: data.cb1,
      cb2: data.cb2,
      soBai: data.soBai,
      hinhThuc: data.hinhThuc,
      thoiGian: data.thoiGian
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4-5)
    if (rowNumber >= 4 && rowNumber <= 5) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 7)
    if (rowNumber === 7) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 7) {
      // Căn trái cho một số cột cụ thể
      const hocPhanCell = row.getCell(2); // Học phần
      const cb1Cell = row.getCell(5);     // Cán bộ coi thi 1
      const cb2Cell = row.getCell(6);     // Cán bộ coi thi 2
      [hocPhanCell, cb1Cell, cb2Cell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `PC_ChamThi_${loaiKyThi.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.replace('-', '_')}_${loaiDaoTao.replace(/\s/g, '_')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportGiangVien = async (dataList, khoa = '') => {
  // Lọc bỏ Admin và sắp xếp theo khoa
  const filteredData = dataList
    .filter(user => user.role !== 'admin')
    .sort((a, b) => (a.khoa || '').localeCompare(b.khoa || ''));

  if (!filteredData || filteredData.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách giảng viên');

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã GV', key: 'maGV', width: 12 },
    { header: 'Họ tên giảng viên', key: 'username', width: 35 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Khoa', key: 'khoa', width: 35 },
    { header: 'Mã ngạch', key: 'maNgach', width: 12 },
    { header: 'Học hàm/Học vị', key: 'hocHamHocVi', width: 20 },
    { header: 'Đơn vị quản lý', key: 'donViQuanLy', width: 35 }
  ];

  // Chuẩn bị tiêu đề
  const title = khoa ? `DANH SÁCH GIẢNG VIÊN KHOA ${khoa.toUpperCase()}` : 'DANH SÁCH GIẢNG VIÊN TOÀN TRƯỜNG';

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG QUẢN LÝ CHẤT LƯỢNG', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', title, '', '', '', '', ''],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng QLCL
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:H4');     // Title

  // Thêm dữ liệu
  filteredData.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      maGV: data.maGV || '',
      username: data.username,
      email: data.email,
      khoa: data.khoa || '',
      maNgach: data.maNgach || '',
      hocHamHocVi: data.hocHamHocVi || '',
      donViQuanLy: data.donViQuanLy || ''
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4)
    if (rowNumber === 4) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 6)
    if (rowNumber === 6) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 6) {
      // Căn trái cho một số cột cụ thể
      const hoTenCell = row.getCell(3);     // Họ tên
      const emailCell = row.getCell(4);      // Email
      const khoaCell = row.getCell(5);       // Khoa
      const donViCell = row.getCell(8);      // Đơn vị quản lý
      [hoTenCell, emailCell, khoaCell, donViCell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const fileName = khoa
    ? `DS_GiangVien_Khoa_${khoa.replace(/\s/g, '_')}.xlsx`
    : 'DS_GiangVien_ToanTruong.xlsx';
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportPCKiemNhiem = async (dataList) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Phân công kiêm nhiệm');

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Chức vụ / Công việc', key: 'chucVu', width: 35 },
    { header: 'Người nhận nhiệm vụ', key: 'user', width: 35 },
    { header: 'Ngày bắt đầu', key: 'startTime', width: 15 },
    { header: 'Ngày kết thúc', key: 'endTime', width: 15 },
    { header: 'Ghi chú', key: 'ghiChu', width: 40 }
  ];

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG TỔ CHỨC - HÀNH CHÍNH', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', 'DANH SÁCH PHÂN CÔNG KIÊM NHIỆM', '', '', '', '', ''],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:E1');     // Trường
  worksheet.mergeCells('F1:L1');     // CHXHCN VN
  worksheet.mergeCells('A2:E2');     // Phòng TC-HC
  worksheet.mergeCells('F2:L2');     // Độc lập
  worksheet.mergeCells('C4:G4');     // Title

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      chucVu: data.chucVu?.tenCV || '',
      user: data.user?.username || '',
      startTime: data.startTime ? new Date(data.startTime).toLocaleDateString('vi-VN') : '',
      endTime: data.endTime ? new Date(data.endTime).toLocaleDateString('vi-VN') : '',
      ghiChu: data.ghiChu || ''
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4)
    if (rowNumber === 4) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 6)
    if (rowNumber === 6) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 6) {
      // Căn trái cho một số cột cụ thể
      const chucVuCell = row.getCell(2);    // Chức vụ
      const userCell = row.getCell(3);      // Người nhận
      const ghiChuCell = row.getCell(6);    // Ghi chú
      [chucVuCell, userCell, ghiChuCell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'DS_PhanCong_KiemNhiem.xlsx';
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportHocPhan = async (dataList) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách học phần thực hành');

  // Thiết lập các cột
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã học phần', key: 'maMH', width: 25 },
    { header: 'Tên học phần', key: 'tenMH', width: 40 },
    { header: 'Số TC', key: 'soTC', width: 8 },
    { header: 'Số tiết LT', key: 'soTietLT', width: 12 },
    { header: 'Số tiết TH', key: 'soTietTH', width: 12 },
    { header: 'Trình độ', key: 'trinhDo', width: 15 },
    { header: 'Số HSSV/nhóm', key: 'soLuong', width: 15 },
    { header: 'Hệ số quy đổi', key: 'heSo', width: 15 },
    { header: 'Ghi chú', key: 'ghiChu', width: 25 }
  ];

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG ĐÀO TẠO', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', 'DANH SÁCH HỌC PHẦN THỰC HÀNH', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:H4');     // Title

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      maMH: data.maMH || '',
      tenMH: data.tenMH || '',
      soTC: data.soTC || '',
      soTietLT: data.soTietLT || '',
      soTietTH: data.soTietTH || '',
      trinhDo: data.trinhDo || '',
      soLuong: data.soLuong || '',
      heSo: data.heSo || '',
      ghiChu: data.ghiChu || ''
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4)
    if (rowNumber === 4) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 6)
    if (rowNumber === 6) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Style cho nội dung bảng
    if (rowNumber > 6) {
      // Căn trái cho một số cột cụ thể
      const tenMHCell = row.getCell(3);     // Tên học phần
      const ghiChuCell = row.getCell(10);   // Ghi chú
      [tenMHCell, ghiChuCell].forEach(cell => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };
      });

      // Căn giữa và màu đặc biệt cho một số cột
      const maMHCell = row.getCell(2);      // Mã học phần
      const soTCCell = row.getCell(4);      // Số TC
      const soTietTHCell = row.getCell(6);  // Số tiết TH

      maMHCell.font = { ...maMHCell.font, color: { argb: '0000FF' } };  // Màu xanh
      soTCCell.font = { ...soTCCell.font, color: { argb: 'FF0000' } };  // Màu đỏ
      soTietTHCell.font = { ...soTietTHCell.font, color: { argb: 'FFA500' } };  // Màu cam
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'DS_HocPhan.xlsx';
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportTongHopLaoDong = async (dataList, type, title, namHoc) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tổng hợp lao động');

  // Thiết lập các cột
  const columns = [
    { header: 'TT', key: 'stt', width: 5 },
    { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
    { header: 'Số tiết LT', key: 'soTietLT', width: 12 },
    { header: 'Số tiết TH', key: 'soTietTH', width: 12 },
    { header: 'Số tiết QC LT', key: 'soTietQCLT', width: 15 },
    { header: 'Số tiết QC TH', key: 'soTietQCTH', width: 15 },
    { header: 'Tổng giảng dạy', key: 'tongGiangDay', width: 15 },
    { header: 'Giờ chuẩn', key: 'gioChuan', width: 12 },
    { header: 'Kiêm nhiệm', key: 'kiemNhiem', width: 12 },
    { header: 'Chuẩn năm học', key: 'chuanNamHoc', width: 12 },
    { header: 'Chấm thi', key: 'chamThi', width: 12 },
    { header: 'Ngoại khóa', key: 'ngoaiKhoa', width: 12 },
    { header: 'Coi thi', key: 'coiThi', width: 12 },
    { header: 'Đề thi', key: 'deThi', width: 12 },
    { header: 'Tổng công tác khác', key: 'tongCongTacKhac', width: 15 },
    { header: 'Tổng giờ chính quy', key: 'tongGioChinhQuy', width: 15 },
    { header: 'Thừa/Thiếu giờ lao động', key: 'thuaThieuGioLaoDong', width: 15 },
  ];

  worksheet.columns = columns;

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG ĐÀO TẠO', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', title, '', '', '', '', '', '', '', '', ''],
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells cho header
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:J4');     // Title
  worksheet.mergeCells('D5:J5');     // Năm học

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      username: data.user?.username || '',
      soTietLT: data.congTacGiangDay?.soTietLT || '',
      soTietTH: data.congTacGiangDay?.soTietTH || '',
      soTietQCLT: data.congTacGiangDay?.soTietQCLT || '',
      soTietQCTH: data.congTacGiangDay?.soTietQCTH || '',
      tongGiangDay: data.congTacGiangDay?.tong || '',
      gioChuan: data.gioChuan || '',
      kiemNhiem: data.kiemNhiem || '',
      chuanNamHoc: data.chuanNamHoc || '',
      chamThi: data.congTacKhac?.chamThi || '',
      ngoaiKhoa: data.congTacKhac?.ngoaiKhoa || '',
      coiThi: data.congTacKhac?.coiThi || '',
      deThi: data.congTacKhac?.deThi || '',
      tongCongTacKhac: data.congTacKhac?.tong || '',
      tongGioChinhQuy: data.tongGioChinhQuy || '',
      thuaThieuGioLaoDong: data.thuaThieuGioLaoDong || ''
    });
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4-5)
    if (rowNumber === 4 || rowNumber === 5) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 7)
    if (rowNumber === 7) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }
    // Style cho nội dung bảng
    if (rowNumber > 7) {
      const usernameCell = row.getCell(2);
      usernameCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      // Tô màu cho các cột tổng
      const tongGiangDayCell = row.getCell(7);
      const tongCongTacKhacCell = row.getCell(14);
      const tongGioCell = row.getCell(15);
      [tongGiangDayCell, tongCongTacKhacCell, tongGioCell].forEach(cell => {
        cell.font = { ...cell.font, color: { argb: 'FF0000' } };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const fileName = type === 'boi-duong'
    ? `TongHop_BoiDuong_${namHoc?.replace('-', '_') || ''}.xlsx`
    : `TongHop_LaoDong_${namHoc?.replace('-', '_') || ''}.xlsx`;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};


const getTitle = (id) => {
  switch (id) {
    case 'CongTacGiangDay':
      return 'CÔNG TÁC GIẢNG DẠY';
    case 'CongTacChamThi':
      return 'CÔNG TÁC CHẤM THI';
    case 'CongTacHuongDan':
      return 'CÔNG TÁC HƯỚNG DẪN';
    case 'CongTacCoiThi':
      return 'CÔNG TÁC COI THI';
    case 'CongTacRaDe':
      return 'CÔNG TÁC RA ĐỀ';
    case 'CongTacKiemNhiem':
      return 'CÔNG TÁC KIÊM NHIỆM';
    default:
      return '';
  }
};

export const exportTongHopLaoDongDetail = async (dataList, id, type, namHoc) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Chi tiết lao động');

  let columns = [];
  
  // Xác định cấu trúc cột dựa trên id
  switch (id) {
    case 'CongTacGiangDay':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Học phần', key: 'hocPhan', width: 20 },
        { header: 'Học kỳ', key: 'ky', width: 10 },
        { header: 'Số TC', key: 'soTinChi', width: 10 },
        { header: 'Lớp học phần', key: 'lopHocPhan', width: 20 },
        { header: 'Số SV', key: 'soSV', width: 10 },
        { header: 'Số tiết LT', key: 'soTietLT', width: 10 },
        { header: 'Số tiết TH', key: 'soTietTH', width: 10 },
        { header: 'Số tiết QC LT', key: 'soTietQCLT', width: 15 },
        { header: 'Số tiết QC TH', key: 'soTietQCTH', width: 15 },
        { header: 'Tổng cộng', key: 'tongCong', width: 15 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    case 'CongTacChamThi':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Học phần chấm thi', key: 'hocPhan', width: 20 },
        { header: 'Lớp học phần', key: 'lopHocPhan', width: 20 },
        { header: 'Học kỳ', key: 'ky', width: 10 },
        { header: 'Cán bộ chấm thi', key: 'canBoChamThi', width: 20 },
        { header: 'Số bài chấm', key: 'soBaiCham', width: 10 },
        { header: 'Số tiết quy chuẩn', key: 'soTietQuyChuan', width: 15 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    case 'CongTacKiemNhiem':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Chức vụ, công việc', key: 'chucVuCongViec', width: 20 },
        { header: 'Thời gian tính', key: 'thoiGianTinh', width: 15 },
        { header: 'Tỷ lệ % miễn giảm', key: 'tyLeMienGiam', width: 15 },
        { header: 'Số tiết quy chuẩn', key: 'soTietQC', width: 15 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    case 'CongTacCoiThi':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Học kỳ', key: 'ky', width: 10 },
        { header: 'Số tiết quy chuẩn', key: 'soTietQuyChuan', width: 15 },
        { header: 'Học phần', key: 'hocPhan', width: 20 },
        { header: 'Thời gian thi', key: 'thoiGianThi', width: 15 },
        { header: 'Ngày thi', key: 'ngayThi', width: 15 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    case 'CongTacHuongDan':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Học phần hướng dẫn', key: 'hocPhan', width: 20 },
        { header: 'Số sinh viên', key: 'soSV', width: 10 },
        { header: 'Số tiết', key: 'soTiet', width: 10 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    case 'CongTacRaDe':
      columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Họ và tên giảng viên', key: 'username', width: 35 },
        { header: 'Học phần', key: 'hocPhan', width: 20 },
        { header: 'Số TC', key: 'soTC', width: 20 },
        { header: 'Lớp học phần', key: 'lopHocPhan', width: 20 },
        { header: 'Hình thức', key: 'hinhThucThi', width: 20 },
        { header: 'Thời gian', key: 'thoiGianThi', width: 20 },
        { header: 'Số tiết QC', key: 'soTietQuyChuan', width: 10 },
        { header: 'Ghi chú', key: 'ghiChu', width: 40 },
      ];
      break;
    default:
      console.error("Invalid id for export");
      return;
  }

  worksheet.columns = columns;

  // Thêm header
  worksheet.spliceRows(1, 0, 
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG ĐÀO TẠO', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', `BẢNG TỔNG HỢP CÔNG TÁC ${getTitle(id)}`, '', '', '', '', '', '', '', '', ''],
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells cho header
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:J4');     // Title
  worksheet.mergeCells('D5:J5');  

 // Thêm dữ liệu
 dataList.forEach((data, index) => {
  const rowData = {
    stt: index + 1,
    username: data.user?.username || '',
    ghiChu: data.ghiChu || '',
  };

  switch (id) {
    case 'CongTacGiangDay':
      Object.assign(rowData, {
        hocPhan: data.hocPhan || '',
        ky: data.ky || '',
        soTinChi: data.soTinChi || '',
        lopHocPhan: data.lopHocPhan || '',
        soSV: data.soSV || '',
        soTietLT: data.soTietLT || '',
        soTietTH: data.soTietTH || '',
        soTietQCLT: data.soTietQCLT || '',
        soTietQCTH: data.soTietQCTH || '',
        tongCong: data.tongCong || '',
      });
      break;
    case 'CongTacChamThi':
      Object.assign(rowData, {
        hocPhan: data.hocPhan || '',
        lopHocPhan: data.lopHocPhan || '',
        ky: data.ky || '',
        canBoChamThi: data.canBoChamThi || '',
        soBaiCham: data.soBaiCham || '',
        soTietQuyChuan: data.soTietQuyChuan || '',
      });
      break;
    case 'CongTacKiemNhiem':
      Object.assign(rowData, {
        chucVuCongViec: data.chucVuCongViec || '',
        thoiGianTinh: data.thoiGianTinh || '',
        tyLeMienGiam: data.tyLeMienGiam || '',
        soTietQC: data.soTietQC || '',
      });
      break;
    case 'CongTacCoiThi':
      Object.assign(rowData, {
        ky: data.ky || '',
        soTietQuyChuan: data.soTietQuyChuan || '',
        hocPhan: data.hocPhan || '',
        thoiGianThi: data.thoiGianThi || '',
        ngayThi: data.ngayThi || '',
      });
      break;
    case 'CongTacHuongDan':
      Object.assign(rowData, {
        hocPhan: data.hocPhan || '',
        soSV: data.soSV || '',
        soTiet: data.soTiet || '',
      });
      break;
    case 'CongTacRaDe':
      Object.assign(rowData, {
        hocPhan: data.hocPhan || '',
        soTiet: data.soTiet || '',
        ngayRaDe: data.ngayRaDe || '',
        hinhThucThi: data.hinhThucThi || '',
        thoiGianThi: data.thoiGianThi || '',
        ghiChu: data.ghiChu || '',
        username: data.user?.username || '',
        soTC: data.soTC || '',
        lopHocPhan: data.lopHocPhan || '',
        soTietQuyChuan: data.soTietQuyChuan || '',
      });
      break;
    default:
      break;
  }

  worksheet.addRow(rowData);
});

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    // Style cho header (2 dòng đầu)
    if (rowNumber <= 2) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    }

    // Style cho tiêu đề (dòng 4-5)
    if (rowNumber === 4 || rowNumber === 5) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 14,
          bold: true
        };
      });
    }

    // Style cho header bảng (dòng 7)
    if (rowNumber === 7) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 12,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }
    // Style cho nội dung bảng
    if (rowNumber > 7) {
      const usernameCell = row.getCell(2);
      usernameCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      // Tô màu cho các cột tổng
      const soTietCell = row.getCell(7); // Ví dụ cho cột số tiết
      [soTietCell].forEach(cell => {
        cell.font = { ...cell.font, color: { argb: 'FF0000' } };
      });
    }
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TongHop_LaoDong_ChiTiet_${type}_${namHoc?.replace('-', '_') || ''}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};