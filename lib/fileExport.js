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

export const exportTongHopLaoDong = async (dataList, type, title, namHoc, selectedKhoa = '') => {
  alert(selectedKhoa)
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

  // Điều chỉnh tiêu đề để hiển thị thêm khoa nếu có
  const displayTitle = selectedKhoa !== ''
    ? `${title} - KHOA ${selectedKhoa.toUpperCase()}`
    : title;

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG ĐÀO TẠO', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', displayTitle, '', '', '', '', '', '', '', '', ''],
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', '', ''],
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
    ? `TongHop_BoiDuong_${namHoc?.replace('-', '_')}${selectedKhoa ? '_Khoa_' + selectedKhoa.replace(/\s+/g, '_') : ''}.xlsx`
    : `TongHop_LaoDong_${namHoc?.replace('-', '_')}${selectedKhoa ? '_Khoa_' + selectedKhoa.replace(/\s+/g, '_') : ''}.xlsx`;
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

export const exportTongHopLaoDongDetail = async (dataList, id, type, namHoc, selectedKhoa) => {
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
        { header: 'Nội dung công việc', key: 'noiDungCongViec', width: 20 },
        { header: 'Số SV/Số nhóm', key: 'soSVSoNhom', width: 10 },
        { header: 'Lớp học phần', key: 'lopHocPhan', width: 20 },
        { header: 'Thời gian', key: 'thoiGian', width: 15 },
        { header: 'Số buổi', key: 'soBuoi', width: 10 },
        { header: 'Số tiết quy chuẩn', key: 'soTietQuyChuan', width: 15 },
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

  // Điều chỉnh tiêu đề để hiển thị thêm khoa nếu có
  const displayTitle = selectedKhoa 
    ? `BẢNG TỔNG HỢP ${getTitle(id)} - KHOA ${selectedKhoa.toUpperCase()}`
    : `BẢNG TỔNG HỢP ${getTitle(id)}`;

  // Thêm header
  worksheet.spliceRows(1, 0, 
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['PHÒNG ĐÀO TẠO', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', displayTitle, '', '', '', '', '', '', '', '', ''],
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells cho header
  worksheet.mergeCells('A1:F1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:F2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:I4');     // Title (với hoặc không có Khoa)
  worksheet.mergeCells('D5:I5');     // Năm học

  
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
        noiDungCongViec: data.noiDungCongViec || '',
        lopHocPhan: data.lopHocPhan || '',
        soSVSoNhom: data.soSVSoNhom || '',
        thoiGian: data.thoiGian || '',
        soBuoi: data.soBuoi || '',
        soTietQuyChuan: data.soTietQuyChuan || '',
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
      // Default style cho tất cả cells
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      
      // Remove all borders by default
      cell.border = undefined;
    });

    // Headers style (TRƯỜNG ĐẠI HỌC PHÚ YÊN, etc.)
    if (rowNumber <= 6) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
      });
    }

    // Title rows style (I., II., III., 1., 2., etc.)
    if ((row.getCell(1).value && typeof row.getCell(1).value === 'string' && 
         (row.getCell(1).value.includes('I.') || row.getCell(1).value.includes('II.') || 
          row.getCell(1).value.includes('III.'))) ||
        (row.getCell(1).value && typeof row.getCell(1).value === 'string' && 
         ['1', '2', '3', '4', '5', '6'].includes(row.getCell(1).value))) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true,
          size: 13
        };
      });
    }

    // Chỉ áp dụng border cho table headers và table data
    const isTableHeader = row.getCell(1).value === 'TT';
    const isTableData = typeof row.getCell(1).value === 'number';
    const isTotalRow = row.getCell(2).value === 'Tổng cộng';

    if (isTableHeader || isTableData || isTotalRow) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Table headers style
    if (isTableHeader) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Total rows style
    if (row.getCell(2).value === 'Tổng cộng' || row.getCell(2).value === 'TỔNG CỘNG') {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true,
          color: { argb: 'FF0000' }
        };
      });
    }

    // Bảng tổng kết style - không có border
    if (row.getCell(2).value && row.getCell(2).value.includes('Tổng số tiết')) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true
        };
        cell.border = undefined;
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



export const exportTongHopLaoDongForUser = async (data, khoa, namHoc) => {
  if (!data || !data.info) {
    console.error("No data available to export");
    return;
  }
  console.log("Kiem nhiem info:", data.info?.kiemNhiemInfo); 
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tổng hợp lao động');

  // Thiết lập cột với chiều rộng hợp lý hơn
  worksheet.columns = [
    { width: 5 },    // A - STT/I.
    { width: 20 },   // B - Label (Chức vụ chính quyền, etc.)
    { width: 15 },   // C - Giá trị 1
    { width: 15 },   // D - Giá trị 2
    { width: 15 },   // E - Khoảng trống
    { width: 20 },   // F - Label phải (Mã ngạch, etc.)
    { width: 15 },   // G - Giá trị phải 1
    { width: 15 },   // H - Giá trị phải 2
    { width: 15 },   // I - Giá trị phải 3
    { width: 10 },   // J
    { width: 10 },   // K
    { width: 10 }    // L
  ];

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    [khoa, '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
    [''],
    ['', '', 'BẢNG THỐNG KÊ TỔNG HỢP LAO ĐỘNG CÁ NHÂN'],
    ['', '', `Năm học: ${namHoc}`],
    ['', '', 'Hệ chính quy'],
    ['']
  );

  // Thông tin giảng viên
  worksheet.addRow(['I.', 'Họ và tên giảng viên/viên chức:', data.info.userInfo.username, '', '', '', '', '', '', '', '', '']);
  worksheet.addRow(['', 'Chức vụ chính quyền:', '', '', '', 'Mã ngạch:', data.info.maNgachInfo.maNgach || '', '', '', '', '', '']);
  worksheet.addRow(['', 'Chức vụ kiêm nhiệm:',  data.info.kiemNhiemInfo.join(', '), '', '', 'Ngạch viên chức:', 'Giảng viên', '', '', '', '', '']);
  worksheet.addRow(['', 'Chức vụ đoàn thể CT-XH:', '', '', '', 'Định mức giờ chuẩn:', '255', '', '', '', '', '']);
  worksheet.addRow(['', '', '', '', '', 'Học hàm, học vị:', data.info.userInfo.hocHamHocVi || '', '', '', '', '', '']);
  worksheet.addRow(['']);

  const rowStart = worksheet.lastRow.number - 5;
  worksheet.mergeCells(`C${rowStart}:F${rowStart}`);        // Họ tên
  worksheet.mergeCells(`B${rowStart + 1}:D${rowStart + 1}`); // Chức vụ chính quyền
  worksheet.mergeCells(`G${rowStart + 1}:I${rowStart + 1}`); // Mã ngạch
  worksheet.mergeCells(`C${rowStart + 2}:E${rowStart + 2}`); // Kiêm nhiệm text
  worksheet.mergeCells(`G${rowStart + 2}:I${rowStart + 2}`); // Ngạch viên chức
  worksheet.mergeCells(`B${rowStart + 3}:D${rowStart + 3}`); // Chức vụ đoàn thể
  worksheet.mergeCells(`G${rowStart + 3}:I${rowStart + 3}`); // Định mức
  worksheet.mergeCells(`G${rowStart + 4}:I${rowStart + 4}`); // Học hàm học vị

  // Style cho phần thông tin giảng viên
  for (let i = rowStart; i <= rowStart + 4; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: cell.col === 1 ? 'center' : 'left',
        wrapText: true
      };
    });

    // Căn giữa cho các giá trị bên phải
    ['G', 'H', 'I'].forEach(col => {
      const cell = row.getCell(col);
      if (cell.value) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
      }
    });
  }

  // Đặt style riêng cho label (in đậm)
  [
    `B${rowStart}`, `B${rowStart + 1}`, `B${rowStart + 2}`, `B${rowStart + 3}`,
    `F${rowStart + 1}`, `F${rowStart + 2}`, `F${rowStart + 3}`, `F${rowStart + 4}`
  ].forEach(cell => {
    worksheet.getCell(cell).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };
  });

  // II. Tổng kết lao động cá nhân
  worksheet.addRow(['II.', 'Tổng kết lao động cá nhân']);
  worksheet.addRow(['']);

  // 1. Công tác giảng dạy
  worksheet.addRow(['1', 'Công tác giảng dạy']);
  
  // Header cho bảng giảng dạy
  const headerGiangDay = ['TT', 'Học phần giảng dạy', 'Học kỳ', 'Số tín chỉ', 'Lớp học phần', 'Số SV', 
    'Số tiết thực dạy', '', 'Số tiết quy chuẩn', '', 'Tổng cộng', 'Ghi chú'];
  const subHeaderGiangDay = ['', '', '', '', '', '', 'LT', 'TH', 'LT', 'TH', '', ''];
  worksheet.addRow(headerGiangDay);
  worksheet.addRow(subHeaderGiangDay);

  

  // Thêm dữ liệu giảng dạy
  let sttGiangDay = 1;
  data.data.CongTacGiangDay.forEach(item => {
    worksheet.addRow([
      sttGiangDay++,
      item.hocPhan,
      item.ky,
      item.soTinChi,
      item.lopHocPhan,
      item.soSV,
      item.soTietLT || 0,
      item.soTietTH || 0,
      item.soTietQCLT || 0,
      item.soTietQCTH || 0,
      item.tongCong,
      item.ghiChu
    ]);
  });

  // Tổng cộng giảng dạy
  const tongGiangDay = data.data.CongTacGiangDay.reduce((acc, item) => ({
    soTietLT: (acc.soTietLT || 0) + (item.soTietLT || 0),
    soTietTH: (acc.soTietTH || 0) + (item.soTietTH || 0),
    soTietQCLT: (acc.soTietQCLT || 0) + (item.soTietQCLT || 0),
    soTietQCTH: (acc.soTietQCTH || 0) + (item.soTietQCTH || 0),
    tongCong: (acc.tongCong || 0) + (item.tongCong || 0)
  }), {});

  worksheet.addRow(['', 'Tổng cộng', '', '', '', '',
    tongGiangDay.soTietLT,
    tongGiangDay.soTietTH,
    tongGiangDay.soTietQCLT,
    tongGiangDay.soTietQCTH,
    tongGiangDay.tongCong,
    ''
  ]);

  worksheet.addRow(['']);

  // 2. Công tác chấm thi
  worksheet.addRow(['2', 'Công tác chấm thi']);
  
  // Header cho bảng chấm thi
  const headerChamThi = ['TT', 'Học phần chấm thi', 'Học kỳ', 'Lớp học phần', 
    'Cán bộ chấm thi', 'Số bài chấm', 'Số tiết quy chuẩn', 'Ghi chú'];
  const subHeaderChamThi = ['', '', '', '', '', '', '', ''];
  worksheet.addRow(headerChamThi);
  worksheet.addRow(subHeaderChamThi);

  // Thêm dữ liệu chấm thi
  let sttChamThi = 1;
  data.data.CongTacChamThi.forEach(item => {
    worksheet.addRow([
      sttChamThi++,
      item.hocPhan,
      item.ky,
      item.lopHocPhan,
      item.canBoChamThi,
      item.soBaiCham,
      item.soTietQuyChuan,
      item.ghiChu
    ]);
  });

  // Tổng cộng chấm thi
  const tongChamThi = data.data.CongTacChamThi.reduce((acc, item) => 
    acc + (item.soTietQuyChuan || 0), 0);
  worksheet.addRow(['', 'Tổng cộng', '', '', '', '', tongChamThi, '']);

  worksheet.addRow(['']);

  // 3. Công tác kiêm nhiệm
  worksheet.addRow(['3', 'Công tác kiêm nhiệm được tính giờ và miễn giảm (Chức vụ Đảng, Công Đoàn, Đoàn Thanh niên, chức vụ chính quyền,...)']);
  
  // Header cho bảng kiêm nhiệm
  const headerKiemNhiem = ['TT', 'Chức vụ, công việc được miễn giảm hoặc tính giờ', 'Thời gian được tính', 
    'Tỷ lệ % miễn giảm', 'Số tiết quy chuẩn', 'Ghi chú'];
  worksheet.addRow(headerKiemNhiem);

  // Thêm dữ liệu kiêm nhiệm
  let sttKiemNhiem = 1;
  data.data.CongTacKiemNhiem.forEach(item => {
    worksheet.addRow([
      sttKiemNhiem++,
      item.chucVuCongViec,
      item.thoiGianTinh,
      item.tyLeMienGiam,
      item.soTietQC,
      item.ghiChu
    ]);
  });

  // Tổng cộng kiêm nhiệm
  const tongKiemNhiem = data.data.CongTacKiemNhiem.reduce((acc, item) => 
    acc + (item.soTietQC || 0), 0);
  worksheet.addRow(['', 'Tổng cộng', '', '', tongKiemNhiem, '']);

  // 4. Công tác coi thi
  worksheet.addRow(['4', 'Công tác coi thi']);
  
  const headerCoiThi = ['TT', 'Học phần', 'Học kỳ', 'Thời gian thi', 'Ngày thi', 'Số tiết quy chuẩn', 'Ghi chú'];
  worksheet.addRow(headerCoiThi);

  let sttCoiThi = 1;
  data.data.CongTacCoiThi.forEach(item => {
    worksheet.addRow([
      sttCoiThi++,
      item.hocPhan,
      item.ky,
      item.thoiGianThi,
      new Date(item.ngayThi).toLocaleDateString('vi-VN'),
      item.soTietQuyChuan,
      item.ghiChu
    ]);
  });

  const tongCoiThi = data.data.CongTacCoiThi.reduce((acc, item) => 
    acc + (item.soTietQuyChuan || 0), 0);
  worksheet.addRow(['', 'Tổng cộng', '', '', '', tongCoiThi, '']);
  worksheet.addRow(['']);

  // 5. Công tác ra đề thi
  worksheet.addRow(['5', 'Công tác ra đề thi']);
  
  const headerRaDe = ['TT', 'Học phần', 'Số TC', 'Lớp học phần', 'Hình thức', 'Thời gian thi', 'Số tiết QC', 'Ghi chú'];
  worksheet.addRow(headerRaDe);

  let sttRaDe = 1;
  data.data.CongTacRaDe.forEach(item => {
    worksheet.addRow([
      sttRaDe++,
      item.hocPhan,
      item.soTC,
      item.lopHocPhan,
      item.hinhThucThi,
      item.thoiGianThi,
      item.soTietQuyChuan,
      item.ghiChu
    ]);
  });

  const tongRaDe = data.data.CongTacRaDe.reduce((acc, item) => 
    acc + (item.soTietQuyChuan || 0), 0);
  worksheet.addRow(['', 'Tổng cộng', '', '', '', '', tongRaDe, '']);
  worksheet.addRow(['']);

  // 6. Công tác hướng dẫn
  worksheet.addRow(['6', 'Công tác hướng dẫn']);
  
  const headerHuongDan = ['TT', 'Nội dung công việc', 'Số SV/Số nhóm', 'Lớp học phần', 'Thời gian', 'Số buổi', 'Số tiết QC', 'Ghi chú'];
  worksheet.addRow(headerHuongDan);

  let sttHuongDan = 1;
  data.data.CongTacHuongDan.forEach(item => {
    worksheet.addRow([
      sttHuongDan++,
      item.noiDungCongViec,
      item.soSVSoNhom,
      item.lopHocPhan,
      item.thoiGian,
      item.soBuoi,
      item.soTietQuyChuan,
      item.ghiChu
    ]);
  });

  const tongHuongDan = data.data.CongTacHuongDan.reduce((acc, item) => 
    acc + (item.soTietQuyChuan || 0), 0);
  worksheet.addRow(['', 'Tổng cộng', '', '', '', '', tongHuongDan, '']);
  worksheet.addRow(['']);

  // III. Bảng tổng kết
  worksheet.addRow(['III.', 'BẢNG TỔNG KẾT']);
  worksheet.addRow(['']);
  
  // Header cho bảng tổng kết
  const headerTongKet = ['STT', 'Nội dung', 'Số tiết quy chuẩn'];
  worksheet.addRow(headerTongKet);

  const tongKet = [
    ['1', 'Tổng số tiết giảng dạy (Công tác giảng dạy)', tongGiangDay.tongCong],
    ['2', 'Tổng số tiết chấm thi (Công tác chấm thi)', tongChamThi],
    ['3', 'Tổng số tiết kiêm nhiệm (Công tác kiêm nhiệm)', tongKiemNhiem],
    ['4', 'Tổng số tiết coi thi (Công tác coi thi)', tongCoiThi],
    ['5', 'Tổng số tiết ra đề thi (Công tác ra đề thi)', tongRaDe],
    ['6', 'Tổng số tiết hướng dẫn (Công tác hướng dẫn)', tongHuongDan],
    ['', 'TỔNG CỘNG', tongGiangDay.tongCong + tongChamThi + tongKiemNhiem + tongCoiThi + tongRaDe + tongHuongDan]
  ];

  // Thêm dữ liệu và style cho bảng tổng kết
  const startRowTongKet = worksheet.lastRow.number;
  tongKet.forEach(row => {
    worksheet.addRow([row[0], row[1], row[2]]);
  });
  const endRowTongKet = worksheet.lastRow.number;

  // Style cho bảng tổng kết
  for (let i = startRowTongKet; i <= endRowTongKet; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell, colNumber) => {
      if (colNumber <= 3) { // Chỉ style cho 3 cột đầu
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center',
          wrapText: true
        };
        
        // Style cho header
        if (i === startRowTongKet) {
          cell.font = {
            ...cell.font,
            bold: true
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2EFDA' }
          };
        }
        
        // Style cho dòng tổng cộng
        if (i === endRowTongKet) {
          cell.font = {
            ...cell.font,
            bold: true,
            color: { argb: 'FF0000' }
          };
        }
      }
    });
  }

  // Merge cells và căn chỉnh cho bảng tổng kết
  worksheet.mergeCells(`B${startRowTongKet - 2}:C${startRowTongKet - 2}`); // Merge title "BẢNG TỔNG KẾT"

  // Điều chỉnh chiều rộng cột cho bảng tổng kết
  worksheet.getColumn(1).width = 5;  // STT
  worksheet.getColumn(2).width = 50; // Nội dung
  worksheet.getColumn(3).width = 15; // Số tiết quy chuẩn

  worksheet.addRow(['']);
  worksheet.addRow(['']);

  // Phần ký tên
  const today = new Date();
  const formattedDate = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  
  worksheet.addRow(['', '', '', '', '', 'Phú Yên, ' + formattedDate]);
  worksheet.addRow(['', 'Trưởng khoa', '', '', '', 'Người thống kê']);
  worksheet.addRow(['', '(Ký và ghi rõ họ tên)', '', '', '', '(Ký và ghi rõ họ tên)']);
  worksheet.addRow(['']);
  worksheet.addRow(['']);
  worksheet.addRow(['']);
  worksheet.addRow(['', '', '', '', '', '', data.info.userInfo.username]);

  // Style improvements
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      // Default style cho tất cả cells
      cell.font = {
        name: 'Times New Roman',
        size: 12,
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      
      // Remove all borders by default
      cell.border = undefined;
    });

    // Headers style (TRƯỜNG ĐẠI HỌC PHÚ YÊN, etc.)
    if (rowNumber <= 6) {
      row.eachCell((cell) => {
        cell.font = {
          name: 'Times New Roman',
          size: 13,
          bold: true
        };
      });
    }

    // Title rows style (I., II., III., 1., 2., etc.)
    if ((row.getCell(1).value && typeof row.getCell(1).value === 'string' && 
         (row.getCell(1).value.includes('I.') || row.getCell(1).value.includes('II.') || 
          row.getCell(1).value.includes('III.'))) ||
        (row.getCell(1).value && typeof row.getCell(1).value === 'string' && 
         ['1', '2', '3', '4', '5', '6'].includes(row.getCell(1).value))) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true,
          size: 13
        };
      });
    }

    // Chỉ áp dụng border cho table headers và table data
    const isTableHeader = row.getCell(1).value === 'TT';
    const isTableData = typeof row.getCell(1).value === 'number';
    const isTotalRow = row.getCell(2).value === 'Tổng cộng';

    if (isTableHeader || isTableData || isTotalRow) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Table headers style
    if (isTableHeader) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      });
    }

    // Total rows style
    if (row.getCell(2).value === 'Tổng cộng' || row.getCell(2).value === 'TỔNG CỘNG') {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true,
          color: { argb: 'FF0000' }
        };
      });
    }

    // Bảng tổng kết style - không có border
    if (row.getCell(2).value && row.getCell(2).value.includes('Tổng số tiết')) {
      row.eachCell((cell) => {
        cell.font = {
          ...cell.font,
          bold: true
        };
        cell.border = undefined;
      });
    }
  });

  // Merge cells for headers
  worksheet.mergeCells('A1:D1');     // Trường
  worksheet.mergeCells('E1:L1');     // CHXHCN VN
  worksheet.mergeCells('A2:D2');     // Phòng Đào tạo
  worksheet.mergeCells('E2:L2');     // Độc lập
  worksheet.mergeCells('C4:J4');     // Title
  worksheet.mergeCells('C5:J5');     // Năm học
  worksheet.mergeCells('C6:J6');     // Hệ

  // Signature section alignment
  const lastRows = worksheet.lastRow.number - 6;
  worksheet.mergeCells(`F${lastRows}:L${lastRows}`);        // Địa điểm, ngày tháng
  worksheet.mergeCells(`B${lastRows + 1}:E${lastRows + 1}`); // Trưởng khoa
  worksheet.mergeCells(`F${lastRows + 1}:L${lastRows + 1}`); // Người thống kê
  worksheet.mergeCells(`B${lastRows + 2}:E${lastRows + 2}`); // Ký tên 1
  worksheet.mergeCells(`F${lastRows + 2}:L${lastRows + 2}`); // Ký tên 2

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TongHop_LaoDong_${data.info.userInfo.username.replace(/\s+/g, '_')}_${namHoc.replace('-', '_')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};