import ExcelJS from 'exceljs';



export const exportTongHopLaoDongForUser = async (data, user, namHoc, kiemNhiem) => {
  console.log('User:', user)
  if (!data || !data.info) {
    console.error("No data available to export");
    return;
  }

  // Phân loại chức vụ
  const chucVuChinhQuyen = user.kiemNhiem
    .filter(cv => cv.loaiCV === 'Chính quyền')
    .map(cv => cv.tenCV)
    .join(', ');

  const chucVuDoanThe = user.kiemNhiem
    .filter(cv => ['Đoàn thể', 'Đoàn hội', 'Đảng', 'Công đoàn'].includes(cv.loaiCV))
    .map(cv => cv.tenCV)
    .join(', ');

  const chucVuKiemNhiem = user.kiemNhiem
    .filter(cv => !['Chính quyền', 'Đoàn thể', 'Đoàn hội', 'Đảng', 'Công đoàn'].includes(cv.loaiCV))
    .map(cv => cv.tenCV)
    .join(', ');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tổng hợp lao động');

  // Reset all cell styles to default to avoid inconsistent styling
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Times New Roman', size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {};
    });
  });

  // Set column widths
  worksheet.columns = [
    { width: 4 },    // A - TT
    { width: 25 },   // B - Họ và tên  
    { width: 7 },    // C - Số tiết LT
    { width: 7 },    // D - Số tiết TH
    { width: 7 },    // E - Số tiết quy chuẩn LT
    { width: 7 },    // F - Số tiết quy chuẩn TH
    { width: 8 },    // G - Tổng giảng dạy
    { width: 8 },    // H - Giờ chuẩn
    { width: 7 },    // I - Kiêm nhiệm
    { width: 7 },    // J - Chuẩn năm học
    { width: 7 },    // K - Chấm thi
    { width: 7 },    // L - Ngoại khóa
    { width: 7 },    // M - Đề thi
    { width: 7 },    // N - Tổng (2)
    { width: 8 },    // O - Tổng giờ chính quy
    { width: 8 },    // P - Thừa/Thiếu
    { width: 7 }     // Q - Ghi chú
  ];

  // Thêm style cho font size nhỏ hơn
  const styles = {
    header: { 
      font: { bold: true, size: 11, name: 'Times New Roman' }, 
      alignment: { horizontal: 'center' } 
    },
    title: { 
      font: { bold: true, size: 13, name: 'Times New Roman' }, 
      alignment: { horizontal: 'center' } 
    },
    bold: { 
      font: { bold: true, size: 11, name: 'Times New Roman' } 
    },
    center: { 
      alignment: { horizontal: 'center' },
      font: { size: 11, name: 'Times New Roman' }
    },
    tableHeader: {
      font: { bold: true, size: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  };

  // Điều chỉnh chiều cao các dòng
  const setRowHeight = (row) => {
    row.height = 20; // Giảm chiều cao dòng xuống
  };

  // Helper function for styling
  const applyStyle = (cell, style) => {
    cell.font = { ...cell.font, ...style.font };
    cell.alignment = { ...cell.alignment, ...style.alignment };
    if (style.border) cell.border = style.border;
    if (style.fill) cell.fill = style.fill;
  };

  // === 1. HEADER ===
  worksheet.addRow(['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  worksheet.mergeCells('A1:G1');
  worksheet.mergeCells('H1:R1');
  applyStyle(worksheet.getCell('A1'), styles.header);
  applyStyle(worksheet.getCell('H1'), styles.header);

  worksheet.addRow([selectedKhoa ? `KHOA ${selectedKhoa.toUpperCase()}` : '', '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  worksheet.mergeCells('A2:G2');
  worksheet.mergeCells('H2:R2');
  applyStyle(worksheet.getCell('A2'), { ...styles.header, font: { ...styles.header.font, underline: true } });
  applyStyle(worksheet.getCell('H2'), { ...styles.header, font: { ...styles.header.font, underline: true } });

  worksheet.addRow([]); // Spacer

  // Title
  const titleRow = worksheet.addRow(['BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ CHÍNH QUY']);
  worksheet.mergeCells(`A4:R4`);
  applyStyle(worksheet.getCell('A4'), styles.title);

  worksheet.addRow([`Năm học: ${namHoc}`]);
  worksheet.mergeCells('A5:R5');
  applyStyle(worksheet.getCell('A5'), { ...styles.title, font: { ...styles.title.font, size: 13 } });

  worksheet.addRow([]); // Spacer

  // Table headers
  const headers = [
    ['TT', 'Họ và tên giảng viên', 'Công tác giảng dạy chính', '', '', '', 'Tổng giảng dạy', 'Giờ chuẩn', 'Kiêm nhiệm', 'Chuẩn năm học', 'Công tác khác', '', '', '', 'Tổng giờ chính quy (4)=(1)+(2)', 'Thừa/Thiếu giờ lao động (5)=(4)-(3)', 'Ghi chú'],
    ['', '', 'Số tiết', '', 'Số tiết quy chuẩn', '', '', '', '', '', 'Chấm thi', 'Ngoại khóa', 'Đề thi', 'Tổng (2)', '', '', ''],
    ['', '', 'LT', 'TH', 'LT', 'TH', '', '', '', '', '', '', '', '', '', '', '']
  ];

  // Add table headers
  headers.forEach((headerRow, idx) => {
    const row = worksheet.addRow(headerRow);
    row.eachCell((cell) => {
      applyStyle(cell, styles.tableHeader);
    });
  });

  // Merge header cells
  worksheet.mergeCells('A7:A9'); // TT
  worksheet.mergeCells('B7:B9'); // Họ và tên
  worksheet.mergeCells('C7:F7'); // Công tác giảng dạy
  worksheet.mergeCells('C8:D8'); // Số tiết
  worksheet.mergeCells('E8:F8'); // Số tiết quy chuẩn
  worksheet.mergeCells('G7:G9'); // Tổng giảng dạy
  worksheet.mergeCells('H7:H9'); // Giờ chuẩn
  worksheet.mergeCells('I7:I9'); // Kiêm nhiệm
  worksheet.mergeCells('J7:J9'); // n năm học
  worksheet.mergeCells('K7:N7'); // Công tác khác
  worksheet.mergeCells('K8:K9'); // Chấm thi
  worksheet.mergeCells('L8:L9'); // Ngoại khóa
  worksheet.mergeCells('M8:M9'); // Đề thi
  worksheet.mergeCells('N8:N9'); // Tổng (2)
  worksheet.mergeCells('O7:O9'); // Tổng giờ chính quy
  worksheet.mergeCells('P7:P9'); // Thừa/Thiếu
  worksheet.mergeCells('Q7:Q9'); // Ghi chú

  // Add data rows
  let totals = {
    soTietLT: 0,
    soTietTH: 0,
    soTietQCLT: 0,
    soTietQCTH: 0,
    tongGiangDay: 0,
    gioChuan: 0,
    kiemNhiem: 0,
    chuanNamHoc: 0,
    chamThi: 0,
    ngoaiKhoa: 0,
    deThi: 0,
    tongCongTacKhac: 0,
    tongGioChinhQuy: 0,
    thuaThieu: 0
  };

  let stt = 1;
  dataList.forEach(item => {
    const tongGiangDay = (item.congTacGiangDay?.tong || 0);
    const tongCongTacKhac = (item.congTacKhac?.tong || 0) 
                           
    const tongCong = tongGiangDay + tongCongTacKhac;
    const thuaThieu = (tongCong - item.gioChuan) || 0;

    // Add data row
    const row = worksheet.addRow([
      stt++,
      item.user?.username || item.tenGV || '',
      item.congTacGiangDay?.soTietLT || 0,
      item.congTacGiangDay?.soTietTH || 0,
      item.congTacGiangDay?.soTietQCLT || 0,
      item.congTacGiangDay?.soTietQCTH || 0,
      tongGiangDay,
      270,
      item.kiemNhiem || 0,
      (270 - (item.kiemNhiem || 0)),
      item.congTacKhac?.chamThi || 0,
      item.congTacKhac?.ngoaiKhoa || 0,
      item.congTacKhac?.deThi || 0,
      tongCongTacKhac,
      tongCong,
      thuaThieu,
      ''
    ]);

    // Update totals
    totals.soTietLT += (item.congTacGiangDay?.soTietLT || 0);
    totals.soTietTH += (item.congTacGiangDay?.soTietTH || 0);
    totals.soTietQCLT += (item.congTacGiangDay?.soTietQCLT || 0);
    totals.soTietQCTH += (item.congTacGiangDay?.soTietQCTH || 0);
    totals.tongGiangDay += tongGiangDay;
    totals.gioChuan += 270;
    totals.kiemNhiem += (item.kiemNhiem || 0);
    totals.chuanNamHoc += (270 - (item.kiemNhiem || 0));
    totals.chamThi += (item.congTacKhac?.chamThi || 0);
    totals.ngoaiKhoa += (item.congTacKhac?.ngoaiKhoa || 0);
    totals.deThi += (item.congTacKhac?.deThi || 0);
    totals.tongCongTacKhac += tongCongTacKhac;
    totals.tongGioChinhQuy += tongCong;
    totals.thuaThieu += thuaThieu;

    // Style data cells
    row.eachCell((cell) => {
      cell.style = {
        font: { size: 11, name: 'Times New Roman' }, // Thêm font style mặc định
        alignment: { vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    });

    // Căn lề trái cho cột tên giảng viên nhưng giữ nguyên font
    applyStyle(row.getCell(2), {
      alignment: { horizontal: 'left', vertical: 'middle' },
      font: { size: 11, name: 'Times New Roman' } // Đảm bảo font giống các cột khác
    });
  });

  // Add empty row before totals
  worksheet.addRow([]);

  // Add totals row with calculated values
  const totalRow = worksheet.addRow([
    '',
    'Tổng cộng',
    totals.soTietLT,
    totals.soTietTH,
    totals.soTietQCLT,
    totals.soTietQCTH,
    totals.tongGiangDay,
    totals.gioChuan,
    totals.kiemNhiem,
    totals.chuanNamHoc,
    totals.chamThi,
    totals.ngoaiKhoa,
    totals.deThi,
    totals.tongCongTacKhac,
    totals.tongGioChinhQuy,
    totals.thuaThieu,
    ''
  ]);

  // Style totals row
  totalRow.eachCell((cell) => {
    cell.style = {
      ...styles.tableHeader,
      font: { bold: true, name: 'Times New Roman' }
    };
  });

  // Add signature section
  worksheet.addRow([]); // Spacer
  worksheet.addRow([]); // Extra spacer for better spacing

  // Add signature date with proper spacing
  const dateRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', 'Đắk Lắk, ngày....... tháng ...... năm 2024']);
  worksheet.mergeCells(`L${dateRow.number}:Q${dateRow.number}`);
  applyStyle(dateRow.getCell('L'), {
    alignment: { horizontal: 'right', vertical: 'middle' },
    font: { italic: true, name: 'Times New Roman', size: 13 }
  });

  // Add signature lines with even spacing
  const sigRow = worksheet.addRow(['TRƯỞNG KHOA', '', '', '', '', '', '', '', '', 'TRƯỞNG BỘ MÔN', '', '', '', 'Người tổng hợp']);

  // Merge and style TRƯỞNG KHOA
  worksheet.mergeCells(`A${sigRow.number}:C${sigRow.number}`);
  applyStyle(sigRow.getCell('A'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 13 }
  });

  // Merge and style TRƯỞNG BỘ MÔN
  worksheet.mergeCells(`J${sigRow.number}:L${sigRow.number}`);
  applyStyle(sigRow.getCell('J'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 13 }
  });

  // Style Người tổng hợp
  worksheet.mergeCells(`N${sigRow.number}:P${sigRow.number}`);
  applyStyle(sigRow.getCell('N'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 13 }
  });

  // Add more spacing for signatures
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TongHop_LaoDong_${namHoc.replace('-', '_')}_${selectedKhoa || 'TatCa'}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};


export const exportPcCoiThi = async (dataList, ky, namHoc, loaiKyThi) => {
  if (!dataList || dataList.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Phân công coi thi');

  // Add title
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `BẢNG PHÂN CÔNG COI THI - KỲ ${ky} NĂM HỌC ${namHoc} ${loaiKyThi ? `- ĐỢT ${loaiKyThi}` : ''}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã HP', key: 'maHocPhan', width: 12 },
    { header: 'Học phần', key: 'hocPhan', width: 30 },
    { header: 'Nhóm/Lớp', key: 'lop', width: 15 },
    { header: 'Ngày thi', key: 'ngayThi', width: 12 },
    { header: 'Ca', key: 'ca', width: 8 },
    { header: 'Phòng thi', key: 'phong', width: 12 },
    { header: 'Cán bộ 1', key: 'cbo1', width: 20 },
    { header: 'Cán bộ 2', key: 'cbo2', width: 20 },
    { header: 'HT', key: 'hinhThuc', width: 8 },
    { header: 'TG', key: 'thoiGian', width: 8 },
  ];

  // Add data
  dataList.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      maHocPhan: item.maHocPhan,
      hocPhan: Array.isArray(item.hocPhan) ? item.hocPhan.join(', ') : item.hocPhan,
      lop: Array.isArray(item.lop) ? item.lop.join(', ') : item.lop,
      ngayThi: item.ngayThi,
      ca: item.ca === '1' ? 'Sáng' : 'Chiều',
      phong: Array.isArray(item.phong) ? item.phong.join(', ') : item.phong,
      cbo1: Array.isArray(item.cbo1) ? item.cbo1.join(' - ') : item.cbo1,
      cbo2: Array.isArray(item.cbo2) ? item.cbo2.join(' - ') : item.cbo2,
      hinhThuc: Array.isArray(item.hinhThuc) ? item.hinhThuc.join(', ') : item.hinhThuc,
      thoiGian: Array.isArray(item.thoiGian) ? item.thoiGian.join(', ') : item.thoiGian,
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      // Center align specific columns
      ['A', 'E', 'F', 'G', 'J', 'K'].forEach(col => {
        row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PhanCongCoiThi_${namHoc}_Ky${ky}${loaiKyThi ? `_Dot${loaiKyThi}` : ''}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Backup function using CSV format if Excel fails
export const exportHocPhanCSV = (dataList) => {
  if (!dataList || dataList.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const headers = ['STT', 'Mã MH', 'Tên MH', 'Số TC', 'Số tiết LT', 'Số tiết TH', 'Trình độ', 'Số HSSV/nhóm', 'Hệ số quy đổi', 'Ghi chú'];
  const csvContent = [
    headers.join(','),
    ...dataList.map((item, idx) => [
      idx + 1,
      `"${item.maMH || ''}"`,
      `"${item.tenMH || ''}"`,
      item.soTC || 0,
      item.soTietLT || 0,
      item.soTietTH || 0,
      `"${item.trinhDo || ''}"`,
      `"${item.soLuong || ''}"`,
      `"${item.heSo || ''}"`,
      `"${item.ghiChu || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;

  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  anchor.download = `DanhSachHocPhan_${dateStr}.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export const exportHocPhan = async (dataList) => {

  if (!dataList || dataList.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }


  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách học phần');

    // Add title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'DANH SÁCH HỌC PHẦN';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add headers
    const headers = ['STT', 'Mã MH', 'Tên MH', 'Số TC', 'Số tiết LT', 'Số tiết TH', 'Trình độ', 'Số HSSV/nhóm', 'Hệ số quy đổi', 'Ghi chú'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    // Add data rows
    dataList.forEach((item, idx) => {
      worksheet.addRow([
        idx + 1,
        item.maMH || '',
        item.tenMH || '',
        item.soTC || 0,
        item.soTietLT || 0,
        item.soTietTH || 0,
        item.trinhDo || '',
        item.soLuong || '',
        item.heSo || '',
        item.ghiChu || ''
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;

    // Get current date for filename
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `DanhSachHocPhan_${dateStr}.xlsx`;
    anchor.download = filename;

    document.body.appendChild(anchor); // Ensure anchor is in DOM
    anchor.click();
    document.body.removeChild(anchor); // Clean up
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error in exportHocPhan:', error);
    exportHocPhanCSV(dataList);
  }
};

export const exportLichThi = async (dataList, title, hocKy, namHoc, loaiDaoTao) => {
  if (!dataList || dataList.length === 0) {
    console.error("No data available to export");
    return;
  }

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
    ['', '', '', `${title} ${loai}`, '', '', '', '', ''],
    ['', '', '', `HỌC KỲ ${hocKy}, NĂM HỌC ${namHoc}`, '', '', '', '', ''],
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
      maHocPhan: data.maHocPhan,
      hocPhan: data.hocPhan,
      lop: data.lop,
      ngayThi: data.ngayThi,
      ca: data.ca === '1' ? 'Sáng' : 'Chiều',
      phong: data.phong,
      thoiGian: data.thoiGian,
      soLuong: data.soLuong
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      // Center align specific columns
      ['A', 'E', 'F', 'G', 'J', 'K'].forEach(col => {
        row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lich_Thi_HK${hocKy}_${namHoc.replace("-", "_")}_${loai}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportPCGD = async (dataList, hocKy, namHoc, selectedKhoa = '') => {
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
  const titleText = selectedKhoa ? `THỜI KHÓA BIỂU GIẢNG DẠY - KHOA ${selectedKhoa.toUpperCase()}` : 'THỜI KHÓA BIỂU GIẢNG DẠY';
  worksheet.spliceRows(1, 0,
    ['UBND TỈNH PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
    [''],
    ['', '', '', titleText],
    ['', '', '', `Học kỳ ${hocKy}, Năm học ${namHoc}`],
    ['']
  );

  // Merge cells
  worksheet.mergeCells('A1:C1'); // UBND
  worksheet.mergeCells('G1:M1'); // CHXHCN VN
  worksheet.mergeCells('A2:C2'); // Trường
  worksheet.mergeCells('G2:M2'); // Độc lập
  worksheet.mergeCells('D4:I4'); // Thời khóa biểu
  worksheet.mergeCells('D5:I5'); // Học kỳ, năm học

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      maHocPhan: data.maHocPhan,
      hocPhan: data.hocPhan,
      lop: data.lop,
      ngayThi: data.ngayThi,
      ca: data.ca === '1' ? 'Sáng' : 'Chiều',
      phong: data.phong,
      thoiGian: data.thoiGian,
      soLuong: data.soLuong
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      // Center align specific columns
      ['A', 'E', 'F', 'G', 'J', 'K'].forEach(col => {
        row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TKB_GiangDay_HK${hocKy}_${namHoc.replace("-", "_")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportChamThi = async (dataList, hocKy, namHoc, loaiKyThi, loai) => {
  // console.log('dataList:', dataList); // Đã kiểm tra có data, bỏ log
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
    { header: 'Cán bộ chấm thi 1', key: 'cb1', width: 25 },
    { header: 'Cán bộ chấm thi 2', key: 'cb2', width: 25 },
    { header: 'Số bài', key: 'soBai', width: 8 },
    { header: 'HT', key: 'hinhThuc', width: 8 },
    { header: 'TG', key: 'thoiGian', width: 8 }
  ];

  // Chuẩn bị tiêu đề học kỳ
  const hocKyTitle = hocKy ? `HỌC KỲ ${hocKy}, NĂM HỌC ${namHoc}` : `NĂM HỌC ${namHoc}`;

  // Thêm header
  worksheet.spliceRows(1, 0,
    ['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', ''],
    ['PHÒNG QUẢN LÝ CHẤT LƯỢNG', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', ''],
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
      maHocPhan: data.maHocPhan,
      hocPhan: data.hocPhan,
      lop: data.lop,
      ngayThi: data.ngayThi,
      ca: data.ca === '1' ? 'Sáng' : 'Chiều',
      phong: data.phong,
      thoiGian: data.thoiGian,
      soLuong: data.soLuong
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      // Center align specific columns
      ['A', 'E', 'F', 'G', 'J', 'K'].forEach(col => {
        row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PhanCongChamThi_${namHoc}_Ky${ky}${loaiKyThi ? `_Dot${loaiKyThi}` : ''}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportTongHopLaoDong = async (dataList, type, title, namHoc, selectedKhoa = '') => {
  if (!dataList || dataList.length === 0) {
    console.error('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tổng hợp lao động');

  // Reset styles
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell((cell) => {
      cell.style = {
        font: { name: 'Times New Roman', size: 13 },
        alignment: { vertical: 'middle' }
      };
    });
  });

  // Set column widths
  worksheet.columns = [
    { width: 4 },    // A - TT
    { width: 25 },   // B - Họ và tên  
    { width: 7 },    // C - Số tiết LT
    { width: 7 },    // D - Số tiết TH
    { width: 7 },    // E - Số tiết quy chuẩn LT
    { width: 7 },    // F - Số tiết quy chuẩn TH
    { width: 8 },    // G - Tổng giảng dạy
    { width: 8 },    // H - Giờ chuẩn
    { width: 7 },    // I - Kiêm nhiệm
    { width: 7 },    // J - Chuẩn năm học
    { width: 7 },    // K - Chấm thi
    { width: 7 },    // L - Ngoại khóa
    { width: 7 },    // M - Đề thi
    { width: 7 },    // N - Tổng (2)
    { width: 8 },    // O - Tổng giờ chính quy
    { width: 8 },    // P - Thừa/Thiếu
    { width: 7 }     // Q - Ghi chú
  ];

  // Thêm style cho font size nhỏ hơn
  const styles = {
    header: { 
      font: { bold: true, size: 11, name: 'Times New Roman' }, 
      alignment: { horizontal: 'center' } 
    },
    title: { 
      font: { bold: true, size: 13, name: 'Times New Roman' }, 
      alignment: { horizontal: 'center' } 
    },
    bold: { 
      font: { bold: true, size: 11, name: 'Times New Roman' } 
    },
    center: { 
      alignment: { horizontal: 'center' },
      font: { size: 11, name: 'Times New Roman' }
    },
    tableHeader: {
      font: { bold: true, size: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  };

  // Helper function for styling
  const applyStyle = (cell, style) => {
    Object.assign(cell.style, style);
  };

  // === HEADER ===
  worksheet.addRow(['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  worksheet.mergeCells('A1:G1');
  worksheet.mergeCells('H1:R1');
  applyStyle(worksheet.getCell('A1'), styles.header);
  applyStyle(worksheet.getCell('H1'), styles.header);

  worksheet.addRow([selectedKhoa ? `KHOA ${selectedKhoa.toUpperCase()}` : '', '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  worksheet.mergeCells('A2:G2');
  worksheet.mergeCells('H2:R2');
  applyStyle(worksheet.getCell('A2'), { ...styles.header, font: { ...styles.header.font, underline: true } });
  applyStyle(worksheet.getCell('H2'), { ...styles.header, font: { ...styles.header.font, underline: true } });

  worksheet.addRow([]); // Spacer

  // Title
  const titleRow = worksheet.addRow(['BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ CHÍNH QUY']);
  worksheet.mergeCells(`A4:R4`);
  applyStyle(worksheet.getCell('A4'), styles.title);

  worksheet.addRow([`Năm học: ${namHoc}`]);
  worksheet.mergeCells('A5:R5');
  applyStyle(worksheet.getCell('A5'), { ...styles.title, font: { ...styles.title.font, size: 13 } });

  worksheet.addRow([]); // Spacer


  // Table headers
  const headers = [
    ['TT', 'Họ và tên giảng viên', 'Công tác giảng dạy chính', '', '', '', 'Tổng giảng dạy', 'Giờ chuẩn', 'Kiêm nhiệm', 'Chuẩn năm học', 'Công tác khác', '', '', '', 'Tổng giờ chính quy (4)=(1)+(2)', 'Thừa/Thiếu giờ lao động (5)=(4)-(3)', 'Ghi chú'],
    ['', '', 'Số tiết', '', 'Số tiết quy chuẩn', '', '', '', '', '', 'Chấm thi', 'Ngoại khóa', 'Đề thi', 'Tổng (2)', '', '', ''],
    ['', '', 'LT', 'TH', 'LT', 'TH', '', '', '', '', '', '', '', '', '', '', '']
  ];

  // Add table headers
  headers.forEach((headerRow, idx) => {
    const row = worksheet.addRow(headerRow);
    row.eachCell((cell) => {
      applyStyle(cell, styles.tableHeader);
    });
  });

  // Merge header cells
  worksheet.mergeCells('A7:A9'); // TT
  worksheet.mergeCells('B7:B9'); // Họ và tên
  worksheet.mergeCells('C7:F7'); // Công tác giảng dạy
  worksheet.mergeCells('C8:D8'); // Số tiết
  worksheet.mergeCells('E8:F8'); // Số tiết quy chuẩn
  worksheet.mergeCells('G7:G9'); // Tổng giảng dạy
  worksheet.mergeCells('H7:H9'); // Giờ chuẩn
  worksheet.mergeCells('I7:I9'); // Kiêm nhiệm
  worksheet.mergeCells('J7:J9'); // n năm học
  worksheet.mergeCells('K7:N7'); // Công tác khác
  worksheet.mergeCells('K8:K9'); // Chấm thi
  worksheet.mergeCells('L8:L9'); // Ngoại khóa
  worksheet.mergeCells('M8:M9'); // Đề thi
  worksheet.mergeCells('N8:N9'); // Tổng (2)
  worksheet.mergeCells('O7:O9'); // Tổng giờ chính quy
  worksheet.mergeCells('P7:P9'); // Thừa/Thiếu
  worksheet.mergeCells('Q7:Q9'); // Ghi chú

  // Add data rows
  let totals = {
    soTietLT: 0,
    soTietTH: 0,
    soTietQCLT: 0,
    soTietQCTH: 0,
    tongGiangDay: 0,
    gioChuan: 0,
    kiemNhiem: 0,
    chuanNamHoc: 0,
    chamThi: 0,
    ngoaiKhoa: 0,
    deThi: 0,
    tongCongTacKhac: 0,
    tongGioChinhQuy: 0,
    thuaThieu: 0
  };

  let stt = 1;
  dataList.forEach(item => {
    const tongGiangDay = (item.congTacGiangDay?.tong || 0);
    const tongCongTacKhac = (item.congTacKhac?.tong || 0) 
                           
    const tongCong = tongGiangDay + tongCongTacKhac;
    const thuaThieu = (tongCong - item.gioChuan) || 0;

    // Add data row
    const row = worksheet.addRow([
      stt++,
      item.user?.username || item.tenGV || '',
      item.congTacGiangDay?.soTietLT || 0,
      item.congTacGiangDay?.soTietTH || 0,
      item.congTacGiangDay?.soTietQCLT || 0,
      item.congTacGiangDay?.soTietQCTH || 0,
      tongGiangDay,
      270,
      item.kiemNhiem || 0,
      (270 - (item.kiemNhiem || 0)),
      item.congTacKhac?.chamThi || 0,
      item.congTacKhac?.ngoaiKhoa || 0,
      item.congTacKhac?.deThi || 0,
      tongCongTacKhac,
      tongCong,
      thuaThieu,
      ''
    ]);

    // Update totals
    totals.soTietLT += (item.congTacGiangDay?.soTietLT || 0);
    totals.soTietTH += (item.congTacGiangDay?.soTietTH || 0);
    totals.soTietQCLT += (item.congTacGiangDay?.soTietQCLT || 0);
    totals.soTietQCTH += (item.congTacGiangDay?.soTietQCTH || 0);
    totals.tongGiangDay += tongGiangDay;
    totals.gioChuan += 270;
    totals.kiemNhiem += (item.kiemNhiem || 0);
    totals.chuanNamHoc += (270 - (item.kiemNhiem || 0));
    totals.chamThi += (item.congTacKhac?.chamThi || 0);
    totals.ngoaiKhoa += (item.congTacKhac?.ngoaiKhoa || 0);
    totals.deThi += (item.congTacKhac?.deThi || 0);
    totals.tongCongTacKhac += tongCongTacKhac;
    totals.tongGioChinhQuy += tongCong;
    totals.thuaThieu += thuaThieu;

    // Style data cells
    row.eachCell((cell) => {
      cell.style = {
        font: { size: 11, name: 'Times New Roman' }, // Thêm font style mặc định
        alignment: { vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    });

    // Căn lề trái cho cột tên giảng viên nhưng giữ nguyên font
    applyStyle(row.getCell(2), {
      alignment: { horizontal: 'left', vertical: 'middle' },
      font: { size: 11, name: 'Times New Roman' } // Đảm bảo font giống các cột khác
    });
  });

  // Add empty row before totals
  worksheet.addRow([]);

  // Add totals row with calculated values
  const totalRow = worksheet.addRow([
    '',
    'Tổng cộng',
    totals.soTietLT,
    totals.soTietTH,
    totals.soTietQCLT,
    totals.soTietQCTH,
    totals.tongGiangDay,
    totals.gioChuan,
    totals.kiemNhiem,
    totals.chuanNamHoc,
    totals.chamThi,
    totals.ngoaiKhoa,
    totals.deThi,
    totals.tongCongTacKhac,
    totals.tongGioChinhQuy,
    totals.thuaThieu,
    ''
  ]);

  // Style totals row
  totalRow.eachCell((cell) => {
    cell.style = {
      ...styles.tableHeader,
      font: { bold: true, name: 'Times New Roman' }
    };
  });

  // Add signature section
  worksheet.addRow([]); // Spacer
  worksheet.addRow([]); // Extra spacer for better spacing

  // Add signature date with proper spacing
  const dateRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', 'Đắk Lắk, ngày....... tháng ...... năm 2024']);
  worksheet.mergeCells(`L${dateRow.number}:Q${dateRow.number}`);
  applyStyle(dateRow.getCell('L'), {
    alignment: { horizontal: 'right', vertical: 'middle' },
    font: { italic: true, name: 'Times New Roman', size: 10 }
  });

  // Add signature lines with even spacing
  const sigRow = worksheet.addRow(['TRƯỞNG KHOA', '', '', '', '', '', '', '', '', 'TRƯỞNG BỘ MÔN', '', '', '', 'Người tổng hợp']);

  // Merge and style TRƯỞNG KHOA
  worksheet.mergeCells(`A${sigRow.number}:C${sigRow.number}`);
  applyStyle(sigRow.getCell('A'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 10 }
  });

  // Merge and style TRƯỞNG BỘ MÔN
  worksheet.mergeCells(`J${sigRow.number}:L${sigRow.number}`);
  applyStyle(sigRow.getCell('J'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 10 }
  });

  // Style Người tổng hợp
  worksheet.mergeCells(`N${sigRow.number}:P${sigRow.number}`);
  applyStyle(sigRow.getCell('N'), {
    ...styles.bold,
    alignment: { horizontal: 'center', vertical: 'middle' },
    font: { bold: true, name: 'Times New Roman', size: 10 }
  });

  // Add more spacing for signatures
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TongHop_LaoDong_${namHoc.replace('-', '_')}_${selectedKhoa || 'TatCa'}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
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
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells cho header
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:H4');     // Title
  worksheet.mergeCells('D5:H5');     // Năm học

  // Thêm dữ liệu - sử dụng cấu trúc dữ liệu đúng cho từng loại công tác
  dataList.forEach((data, index) => {
    const rowData = {
      stt: index + 1,
      username: data.user?.username ?? '',
    };

    // Thêm dữ liệu dựa trên loại công tác
    switch (id) {
      case 'CongTacGiangDay':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          ky: data.ky ?? '',
          soTinChi: data.soTinChi ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          soSV: data.soSV ?? '',
          soTietLT: data.soTietLT ?? '',
          soTietTH: data.soTietTH ?? '',
          soTietQCLT: data.soTietQCLT ?? '',
          soTietQCTH: data.soTietQCTH ?? '',
          tongCong: data.tongCong ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacChamThi':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          ky: data.ky ?? '',
          canBoChamThi: data.canBoChamThi ?? '',
          soBaiCham: data.soBaiCham ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacKiemNhiem':
        Object.assign(rowData, {
          chucVuCongViec: data.chucVuCongViec ?? '',
          thoiGianTinh: data.thoiGianTinh ?? '',
          tyLeMienGiam: data.tyLeMienGiam ?? '',
          soTietQC: data.soTietQC ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacCoiThi':
        Object.assign(rowData, {
          ky: data.ky ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          hocPhan: data.hocPhan ?? '',
          thoiGianThi: data.thoiGianThi ?? '',
          ngayThi: data.ngayThi ? new Date(data.ngayThi).toLocaleDateString('vi-VN') : '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacHuongDan':
        Object.assign(rowData, {
          noiDungCongViec: data.noiDungCongViec ?? '',
          soSVSoNhom: data.soSVSoNhom ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          thoiGian: data.thoiGian ?? '',
          soBuoi: data.soBuoi ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacRaDe':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          soTC: data.soTC ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          hinhThucThi: data.hinhThucThi ?? '',
          thoiGianThi: data.thoiGianThi ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
    }

    worksheet.addRow(rowData);
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Times New Roman',
        size: rowNumber <= 2 ? 13 : rowNumber === 4 || rowNumber === 5 ? 14 : 12,
        bold: rowNumber <= 2 || rowNumber === 4 || rowNumber === 5 || rowNumber === 7
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: rowNumber <= 2 ? 'left' : 'center',
        wrapText: true
      };
      // Tô màu header bảng
      if (rowNumber === 7) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      }
      // Border cho bảng dữ liệu
      if (rowNumber >= 7) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      // Căn trái cho tên giảng viên
      if (rowNumber > 7 && colNumber === 2) {
        cell.alignment = { ...cell.alignment, horizontal: 'left' };
      }
      // Tô màu đỏ cho các cột tổng
      if (rowNumber > 7 && (colNumber === 7 || colNumber === 14 || colNumber === 15)) {
        cell.font = { ...cell.font, color: { argb: 'FF0000' } };
      }
    });
    // Tăng chiều cao cho header
    if (rowNumber === 7) row.height = 30;
  });

  worksheet.views = [{ state: 'frozen', ySplit: 7 }]; // Freeze header

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


export const exportTongHopLaoDongChiTiet = async (dataList, id, type, namHoc, selectedKhoa) => {
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
    ['', '', '', `NĂM HỌC ${namHoc || ''}`, '', '', '', '', '', '', '', '', '', ''],
    ['']
  );

  // Merge cells cho header
  worksheet.mergeCells('A1:C1');     // Trường
  worksheet.mergeCells('G1:M1');     // CHXHCN VN
  worksheet.mergeCells('A2:C2');     // Phòng Đào tạo
  worksheet.mergeCells('G2:M2');     // Độc lập
  worksheet.mergeCells('D4:H4');     // Title
  worksheet.mergeCells('D5:H5');     // Năm học

  // Thêm dữ liệu - sử dụng cấu trúc dữ liệu đúng cho từng loại công tác
  dataList.forEach((data, index) => {
    const rowData = {
      stt: index + 1,
      username: data.user?.username ?? '',
    };

    // Thêm dữ liệu dựa trên loại công tác
    switch (id) {
      case 'CongTacGiangDay':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          ky: data.ky ?? '',
          soTinChi: data.soTinChi ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          soSV: data.soSV ?? '',
          soTietLT: data.soTietLT ?? '',
          soTietTH: data.soTietTH ?? '',
          soTietQCLT: data.soTietQCLT ?? '',
          soTietQCTH: data.soTietQCTH ?? '',
          tongCong: data.tongCong ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacChamThi':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          ky: data.ky ?? '',
          canBoChamThi: data.canBoChamThi ?? '',
          soBaiCham: data.soBaiCham ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacKiemNhiem':
        Object.assign(rowData, {
          chucVuCongViec: data.chucVuCongViec ?? '',
          thoiGianTinh: data.thoiGianTinh ?? '',
          tyLeMienGiam: data.tyLeMienGiam ?? '',
          soTietQC: data.soTietQC ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacCoiThi':
        Object.assign(rowData, {
          ky: data.ky ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          hocPhan: data.hocPhan ?? '',
          thoiGianThi: data.thoiGianThi ?? '',
          ngayThi: data.ngayThi ? new Date(data.ngayThi).toLocaleDateString('vi-VN') : '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacHuongDan':
        Object.assign(rowData, {
          noiDungCongViec: data.noiDungCongViec ?? '',
          soSVSoNhom: data.soSVSoNhom ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          thoiGian: data.thoiGian ?? '',
          soBuoi: data.soBuoi ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
      case 'CongTacRaDe':
        Object.assign(rowData, {
          hocPhan: data.hocPhan ?? '',
          soTC: data.soTC ?? '',
          lopHocPhan: data.lopHocPhan ?? '',
          hinhThucThi: data.hinhThucThi ?? '',
          thoiGianThi: data.thoiGianThi ?? '',
          soTietQuyChuan: data.soTietQuyChuan ?? '',
          ghiChu: data.ghiChu ?? ''
        });
        break;
    }

    worksheet.addRow(rowData);
  });

  // Style cho toàn bộ worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Times New Roman',
        size: rowNumber <= 2 ? 13 : rowNumber === 4 || rowNumber === 5 ? 14 : 12,
        bold: rowNumber <= 2 || rowNumber === 4 || rowNumber === 5 || rowNumber === 7
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: rowNumber <= 2 ? 'left' : 'center',
        wrapText: true
      };
      // Tô màu header bảng
      if (rowNumber === 7) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }
        };
      }
      // Border cho bảng dữ liệu
      if (rowNumber >= 7) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      // Căn trái cho tên giảng viên
      if (rowNumber > 7 && colNumber === 2) {
        cell.alignment = { ...cell.alignment, horizontal: 'left' };
      }
      // Tô màu đỏ cho các cột tổng
      if (rowNumber > 7 && (colNumber === 7 || colNumber === 14 || colNumber === 15)) {
        cell.font = { ...cell.font, color: { argb: 'FF0000' } };
      }
    });
    // Tăng chiều cao cho header
    if (rowNumber === 7) row.height = 30;
  });

  worksheet.views = [{ state: 'frozen', ySplit: 7 }]; // Freeze header

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



