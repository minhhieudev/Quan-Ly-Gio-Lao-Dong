import ExcelJS from 'exceljs';


export const exportTongHopLaoDongForUser = async (data, user, namHoc, kiemNhiem) => {
  console.log('data.info.userInfo:',user)
  if (!data || !data.info) {
    console.error("No data available to export");
    return;
  }

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
    { width: 5 },   // A
    { width: 25 },  // B
    { width: 10 },  // C
    { width: 10 },  // D
    { width: 10 },  // E
    { width: 10 },  // F
    { width: 18 },  // G
    { width: 15 },  // H
    { width: 10 },  // I
    { width: 10 },  // J
    { width: 10 },  // K
    { width: 10 },  // L
    { width: 10 },  // M
    { width: 10 },  // N
    { width: 10 },  // O
  ];

  // Helper function for styling
  const applyStyle = (cell, style) => {
    cell.font = { ...cell.font, ...style.font };
    cell.alignment = { ...cell.alignment, ...style.alignment };
    if (style.border) cell.border = style.border;
    if (style.fill) cell.fill = style.fill;
  };

  const styles = {
    header: { font: { bold: true, size: 13, name: 'Times New Roman' }, alignment: { horizontal: 'center' } },
    title: { font: { bold: true, size: 14, name: 'Times New Roman' }, alignment: { horizontal: 'center' } },
    bold: { font: { bold: true, name: 'Times New Roman' } },
    center: { alignment: { horizontal: 'center' } },
    right: { alignment: { horizontal: 'right' } },
    tableHeader: { font: { bold: true, name: 'Times New Roman' }, alignment: { horizontal: 'center', wrapText: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC' } } },
    tableBorder: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
    normal: { font: { name: 'Times New Roman' } }
  };

  // === 1. HEADER ===
  worksheet.addRow(['TRƯỜNG ĐẠI HỌC PHÚ YÊN', '', '', '', '', '', '', 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  worksheet.mergeCells('A1:F1');
  worksheet.mergeCells('H1:O1');
  applyStyle(worksheet.getCell('A1'), styles.header);
  applyStyle(worksheet.getCell('H1'), styles.header);

  worksheet.addRow([`KHOA ${user.tenKhoa.toUpperCase()}`, '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  worksheet.mergeCells('A2:F2');
  worksheet.mergeCells('H2:O2');
  applyStyle(worksheet.getCell('A2'), { ...styles.header, font: { ...styles.header.font, underline: true } });
  applyStyle(worksheet.getCell('H2'), { ...styles.header, font: { ...styles.header.font, underline: true } });

  worksheet.addRow([]); // Spacer

  worksheet.addRow(['', 'BẢNG THỐNG KÊ TỔNG HỢP LAO ĐỘNG CÁ NHÂN – HỆ CHÍNH QUY']);
  worksheet.mergeCells('B4:N4');
  applyStyle(worksheet.getCell('B4'), styles.title);

  worksheet.addRow(['', `Năm học: ${namHoc}`]);
  worksheet.mergeCells('B5:N5');
  applyStyle(worksheet.getCell('B5'), { ...styles.bold, ...styles.center });

  worksheet.addRow([]); // Spacer

  // === 2. THÔNG TIN CÁ NHÂN ===
  const infoSectionRow = worksheet.addRow(['I.', 'Thông tin cá nhân']);
  applyStyle(infoSectionRow.getCell('A'), styles.bold);
  applyStyle(infoSectionRow.getCell('B'), styles.bold);

  const infoRow1 = worksheet.addRow(['', 'Họ và tên giảng viên:', data.info.userInfo.username, '', '', '', 'Mã ngạch:', data.info.maNgachInfo.maNgach || '']);
  worksheet.mergeCells('C8:F8');
  worksheet.mergeCells('H8:I8');
  applyStyle(infoRow1.getCell('C'), styles.bold);

  const infoRow2 = worksheet.addRow(['', 'Chức vụ chính quyền:', 'Không', '', '', '', 'Học hàm, học vị:', data.info.userInfo.hocHamHocVi || '']);
  worksheet.mergeCells('C9:F9');
  worksheet.mergeCells('H9:I9');

  const infoRow3 = worksheet.addRow(['', 'Chức vụ kiêm nhiệm:', 'Không', '', '', '', 'Định mức giờ chuẩn:', data.info.maNgachInfo.GCGD || 0]);
  //const infoRow3 = worksheet.addRow(['', 'Chức vụ kiêm nhiệm:', 'Không', '', '', '', 'Định mức giờ chuẩn:', data.info.maNgachInfo.GCGD - kiemNhiem || 0]);
  worksheet.mergeCells('C10:F10');
  worksheet.mergeCells('H10:I10');

  const infoRow4 = worksheet.addRow(['', 'Chức vụ đoàn thể CT - XH:', data.info.chucVuDoanThe || '']);
  worksheet.mergeCells('C11:F11');

  worksheet.addRow([]); // Spacer

  // === 3. NỘI DUNG THỐNG KÊ ===
  const noiDungSectionRow = worksheet.addRow(['II.', 'Nội dung thống kê']);
  applyStyle(noiDungSectionRow.getCell('A'), styles.bold);
  applyStyle(noiDungSectionRow.getCell('B'), styles.bold);

  // --- 3.1 CÔNG TÁC GIẢNG DẠY ---
  const giangDayTitleRow = worksheet.addRow(['', '1. Công tác giảng dạy']);
  applyStyle(giangDayTitleRow.getCell('B'), styles.bold);

  // Table Header
  const giangDayHeader1 = worksheet.addRow(['TT', 'Học phần giảng dạy', 'Học kỳ', 'Số TC', 'Lớp học phần', 'Số SV', 'Số tiết', '', 'Số tiết quy chuẩn', '', 'Tổng cộng', 'Ghi chú']);
  const giangDayHeader2 = worksheet.addRow(['', '', '', '', '', '', 'LT', 'TH', 'LT', 'TH', '', '']);
  const startHeaderRow = giangDayHeader1.number;
  worksheet.mergeCells(`A${startHeaderRow}:A${startHeaderRow + 1}`);
  worksheet.mergeCells(`B${startHeaderRow}:B${startHeaderRow + 1}`);
  worksheet.mergeCells(`C${startHeaderRow}:C${startHeaderRow + 1}`);
  worksheet.mergeCells(`D${startHeaderRow}:D${startHeaderRow + 1}`);
  worksheet.mergeCells(`E${startHeaderRow}:E${startHeaderRow + 1}`);
  worksheet.mergeCells(`F${startHeaderRow}:F${startHeaderRow + 1}`);
  worksheet.mergeCells(`G${startHeaderRow}:H${startHeaderRow}`);
  worksheet.mergeCells(`I${startHeaderRow}:J${startHeaderRow}`);
  worksheet.mergeCells(`K${startHeaderRow}:K${startHeaderRow + 1}`);
  worksheet.mergeCells(`L${startHeaderRow}:L${startHeaderRow + 1}`);

  // Style Header
  for (let i = 1; i <= 12; i++) {
    applyStyle(giangDayHeader1.getCell(i), { ...styles.tableHeader, border: styles.tableBorder });
    applyStyle(giangDayHeader2.getCell(i), { ...styles.tableHeader, border: styles.tableBorder });
  }

  // Table Data
  let sttGiangDay = 1;
  data.data.CongTacGiangDay.forEach(item => {
    const row = worksheet.addRow([
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
    row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
  });

  // Table Footer (Tổng cộng)
  const tongGiangDay = data.data.CongTacGiangDay.reduce((acc, item) => ({
    soTietLT: (acc.soTietLT || 0) + (parseFloat(item.soTietLT) || 0),
    soTietTH: (acc.soTietTH || 0) + (parseFloat(item.soTietTH) || 0),
    soTietQCLT: (acc.soTietQCLT || 0) + (parseFloat(item.soTietQCLT) || 0),
    soTietQCTH: (acc.soTietQCTH || 0) + (parseFloat(item.soTietQCTH) || 0),
    tongCong: (acc.tongCong || 0) + (parseFloat(item.tongCong) || 0)
  }), {});

  const totalGiangDayRow = worksheet.addRow(['', 'Tổng cộng', '', '', '', '', tongGiangDay.soTietLT, tongGiangDay.soTietTH, tongGiangDay.soTietQCLT, tongGiangDay.soTietQCTH, tongGiangDay.tongCong, '']);
  worksheet.mergeCells(`B${totalGiangDayRow.number}:F${totalGiangDayRow.number}`);
  totalGiangDayRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // --- 3.2 CÔNG TÁC CHẤM THI ---
  const chamThiTitleRow = worksheet.addRow(['', '2. Công tác chấm thi']);
  applyStyle(chamThiTitleRow.getCell('B'), styles.bold);

  // Header
  const chamThiHeader = worksheet.addRow(['TT', 'Học phần chấm thi', 'Học kỳ', 'Lớp học phần', 'Cán bộ chấm thi', 'Số bài chấm', 'Số tiết quy chuẩn', 'Ghi chú']);
  chamThiHeader.eachCell(cell => applyStyle(cell, { ...styles.tableHeader, border: styles.tableBorder }));

  // Data
  let sttChamThi = 1;
  data.data.CongTacChamThi.forEach(item => {
    const row = worksheet.addRow([
      sttChamThi++,
      item.hocPhan,
      item.ky,
      item.lopHocPhan,
      item.canBoChamThi,
      item.soBaiCham,
      item.soTietQuyChuan,
      item.ghiChu
    ]);
    row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
  });

  // Footer
  const tongChamThi = data.data.CongTacChamThi.reduce((acc, item) =>
    ({
      soBai: acc.soBai + (item.soBaiCham || 0),
      soTiet: acc.soTiet + (item.soTietQuyChuan || 0)
    }), { soBai: 0, soTiet: 0 });
  const totalChamThiRow = worksheet.addRow(['', 'Tổng cộng', '', '', '', tongChamThi.soBai, tongChamThi.soTiet, '']);
  worksheet.mergeCells(`B${totalChamThiRow.number}:E${totalChamThiRow.number}`);
  totalChamThiRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // --- 3.3 CÔNG TÁC HƯỚNG DẪN ---
  const huongDanTitleRow = worksheet.addRow(['', '3. Công tác hướng dẫn thực hành, thực tập, TNC, ngoại khóa, rèn luyện nghiệp vụ']);
  applyStyle(huongDanTitleRow.getCell('B'), styles.bold);
  worksheet.mergeCells(`B${huongDanTitleRow.number}:M${huongDanTitleRow.number}`);

  const huongDanHeader = worksheet.addRow(['TT', 'Nội dung công việc', 'Số SV/Số nhóm', 'Lớp học phần', 'Thời gian', 'Số buổi', 'Số tiết quy chuẩn', 'Tổng cộng', 'Ghi chú']);
  huongDanHeader.eachCell(cell => applyStyle(cell, { ...styles.tableHeader, border: styles.tableBorder }));
  worksheet.mergeCells(`B${huongDanHeader.number}:C${huongDanHeader.number}`);

  let sttHuongDan = 1;
  data.data.CongTacHuongDan.forEach(item => {
    const row = worksheet.addRow([
        sttHuongDan++,
        item.noiDungCongViec,
        item.soSVSoNhom,
        item.lopHocPhan,
        item.thoiGian,
        item.soBuoi,
        item.soTietQuyChuan,
        item.soTietQuyChuan, // Assuming Tong Cong is same as So tiet QC
        item.ghiChu
    ]);
    row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
    worksheet.mergeCells(`B${row.number}:C${row.number}`);
  });

  const tongHuongDan = data.data.CongTacHuongDan.reduce((acc, item) => acc + (item.soTietQuyChuan || 0), 0);
  const totalHuongDanRow = worksheet.addRow(['', 'Tổng cộng', '', '', '', '', '', tongHuongDan, '']);
  worksheet.mergeCells(`B${totalHuongDanRow.number}:G${totalHuongDanRow.number}`);
  totalHuongDanRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // --- 3.4 CÔNG TÁC COI THI ---
  const coiThiTitleRow = worksheet.addRow(['', '4. Công tác coi thi']);
  applyStyle(coiThiTitleRow.getCell('B'), styles.bold);

  const coiThiHeader = worksheet.addRow(['TT', 'Học phần', 'Học kỳ', 'Thời gian thi', 'Ngày thi', 'Số tiết quy chuẩn', 'Ghi chú']);
  coiThiHeader.eachCell(cell => applyStyle(cell, { ...styles.tableHeader, border: styles.tableBorder }));

  let sttCoiThi = 1;
  data.data.CongTacCoiThi.forEach(item => {
    const row = worksheet.addRow([
        sttCoiThi++,
        item.hocPhan,
        item.ky,
        item.thoiGianThi,
        new Date(item.ngayThi).toLocaleDateString('vi-VN'),
        item.soTietQuyChuan,
        item.ghiChu
    ]);
    row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
  });

  const tongCoiThi = data.data.CongTacCoiThi.reduce((acc, item) => acc + (item.soTietQuyChuan || 0), 0);
  const totalCoiThiRow = worksheet.addRow(['', 'Tổng cộng', '', '', '', tongCoiThi, '']);
  worksheet.mergeCells(`B${totalCoiThiRow.number}:E${totalCoiThiRow.number}`);
  totalCoiThiRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // --- 3.5 CÔNG TÁC RA ĐỀ THI ---
  const raDeTitleRow = worksheet.addRow(['', '5. Công tác ra đề thi']);
  applyStyle(raDeTitleRow.getCell('B'), styles.bold);

  const raDeHeader = worksheet.addRow(['TT', 'Học phần', 'Số TC', 'Học kỳ', 'Lớp học phần', 'Hình thức thi', 'Thời gian thi', 'Số tiết quy chuẩn', 'Ghi chú']);
  raDeHeader.eachCell(cell => applyStyle(cell, { ...styles.tableHeader, border: styles.tableBorder }));

  let sttRaDe = 1;
  data.data.CongTacRaDe.forEach(item => {
      const row = worksheet.addRow([sttRaDe++, item.hocPhan, item.soTC, item.ky || '', item.lopHocPhan, item.hinhThucThi, item.thoiGianThi, item.soTietQuyChuan, item.ghiChu]);
      row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
  });

  const tongRaDe = data.data.CongTacRaDe.reduce((acc, item) => acc + (item.soTietQuyChuan || 0), 0);
  const totalRaDeRow = worksheet.addRow(['', 'Tổng cộng', '', '', '', '', '', tongRaDe, '']);
  worksheet.mergeCells(`B${totalRaDeRow.number}:G${totalRaDeRow.number}`);
  totalRaDeRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // --- 3.6 CÔNG TÁC KIÊM NHIỆM ---
  const kiemNhiemTitleRow = worksheet.addRow(['', '6. Công tác kiêm nhiệm được tính giờ và miễn giảm (Chức vụ Đảng, Công Đoàn, Đoàn TN, chức vụ chính quyền,...)']);
  applyStyle(kiemNhiemTitleRow.getCell('B'), styles.bold);
  worksheet.mergeCells(`B${kiemNhiemTitleRow.number}:M${kiemNhiemTitleRow.number}`);

  const kiemNhiemHeader = worksheet.addRow(['TT', 'Chức vụ, công việc được miễn giảm hoặc tính giờ', 'Thời gian được tính', 'Tỷ lệ % miễn giảm', 'Số tiết quy chuẩn', 'Ghi chú']);
  kiemNhiemHeader.eachCell(cell => applyStyle(cell, { ...styles.tableHeader, border: styles.tableBorder }));

  let sttKiemNhiem = 1;
  data.data.CongTacKiemNhiem.forEach(item => {
      const row = worksheet.addRow([sttKiemNhiem++, item.chucVuCongViec, item.thoiGianTinh, item.tyLeMienGiam, item.soTietQC, item.ghiChu]);
      row.eachCell(cell => applyStyle(cell, { border: styles.tableBorder, alignment: { horizontal: 'center' } }));
  });

  const tongKiemNhiem = data.data.CongTacKiemNhiem.reduce((acc, item) => acc + (item.soTietQC || 0), 0);
  const totalKiemNhiemRow = worksheet.addRow(['', 'Tổng cộng', '', '', tongKiemNhiem, '']);
  worksheet.mergeCells(`B${totalKiemNhiemRow.number}:D${totalKiemNhiemRow.number}`);
  totalKiemNhiemRow.eachCell(cell => applyStyle(cell, { ...styles.bold, border: styles.tableBorder, alignment: { horizontal: 'center' } }));

  worksheet.addRow([]); // Spacer

  // === III. TỔNG KẾT ===
  const tongKetSectionRow = worksheet.addRow(['III.', 'Tổng kết']);
  applyStyle(tongKetSectionRow.getCell('A'), styles.bold);
  applyStyle(tongKetSectionRow.getCell('B'), styles.bold);
  worksheet.addRow([]);

  // Calculate final totals
  const tongGioThucHien = (
    (tongGiangDay.tongCong || 0) +
    (tongChamThi.soTiet || 0) +
    (tongHuongDan || 0) +
    (tongCoiThi || 0) +
    (tongRaDe || 0)
  );
  const dinhMucChuan = data.info.maNgachInfo.GCGD || 0;
  const dinhMucPhaiThucHien = dinhMucChuan - (tongKiemNhiem || 0);
  const thuaThieuGio = Math.abs(tongGioThucHien - dinhMucPhaiThucHien);

  // Data for summary tables
  const summaryData1 = [
    ['1', 'Công tác giảng dạy', tongGiangDay.tongCong.toFixed(1)],
    ['2', 'Công tác chấm thi', tongChamThi.soTiet.toFixed(1)],
    ['3', 'Hướng dẫn thực hành, thực tập...', tongHuongDan.toFixed(1)],
    ['4', 'Công tác coi thi', tongCoiThi.toFixed(1)],
    ['5', 'Công tác ra đề thi', tongRaDe.toFixed(1)],
  ];

  const summaryData2 = [
    ['Định mức giờ chuẩn của ngạch theo quy định', dinhMucChuan],
    ['Số giờ kiêm nhiệm được miễn giảm', tongKiemNhiem],
    ['Định mức giờ chuẩn năm học phải thực hiện', dinhMucPhaiThucHien],
    ['Phục vụ cộng đồng', ''],
    ['Nghiên cứu khoa học', ''],
  ];

  // Draw summary tables
  const startSummaryRow = worksheet.lastRow.number + 1;

  // Headers
  const headerRow = worksheet.getRow(startSummaryRow);
  headerRow.getCell('A').value = 'TT';
  headerRow.getCell('B').value = 'Nội dung';
  headerRow.getCell('E').value = 'Số giờ đã thực hiện (quy chuẩn)';
  headerRow.getCell('H').value = 'Nội dung';
  headerRow.getCell('K').value = 'Số giờ';

  const tableHeaderStyle = { ...styles.tableHeader, border: styles.tableBorder };
  applyStyle(headerRow.getCell('A'), tableHeaderStyle);
  applyStyle(headerRow.getCell('B'), tableHeaderStyle);
  applyStyle(headerRow.getCell('C'), tableHeaderStyle);
  applyStyle(headerRow.getCell('D'), tableHeaderStyle);
  applyStyle(headerRow.getCell('E'), tableHeaderStyle);
  worksheet.mergeCells(`B${startSummaryRow}:D${startSummaryRow}`);

  applyStyle(headerRow.getCell('H'), tableHeaderStyle);
  applyStyle(headerRow.getCell('I'), tableHeaderStyle);
  applyStyle(headerRow.getCell('J'), tableHeaderStyle);
  applyStyle(headerRow.getCell('K'), tableHeaderStyle);
  worksheet.mergeCells(`H${startSummaryRow}:J${startSummaryRow}`);

  // Data
  for (let i = 0; i < Math.max(summaryData1.length, summaryData2.length); i++) {
    const row = worksheet.getRow(startSummaryRow + 1 + i);
    if (summaryData1[i]) {
      row.getCell('A').value = summaryData1[i][0];
      row.getCell('B').value = summaryData1[i][1];
      row.getCell('E').value = summaryData1[i][2];
      applyStyle(row.getCell('A'), { border: styles.tableBorder, alignment: { horizontal: 'center' } });
      applyStyle(row.getCell('B'), { border: styles.tableBorder });
      applyStyle(row.getCell('C'), { border: styles.tableBorder });
      applyStyle(row.getCell('D'), { border: styles.tableBorder });
      applyStyle(row.getCell('E'), { border: styles.tableBorder, alignment: { horizontal: 'center' } });
      worksheet.mergeCells(`B${row.number}:D${row.number}`);
    }
    if (summaryData2[i]) {
      row.getCell('H').value = summaryData2[i][0];
      row.getCell('K').value = summaryData2[i][1];
      applyStyle(row.getCell('H'), { border: styles.tableBorder });
      applyStyle(row.getCell('I'), { border: styles.tableBorder });
      applyStyle(row.getCell('J'), { border: styles.tableBorder });
      applyStyle(row.getCell('K'), { border: styles.tableBorder, alignment: { horizontal: 'center' } });
      worksheet.mergeCells(`H${row.number}:J${row.number}`);
    }
  }

  // Total row for table 1
  const totalRow1 = worksheet.getRow(startSummaryRow + 1 + summaryData1.length);
  totalRow1.getCell('A').value = 'Tổng số giờ chính quy đã thực hiện trong năm';
  totalRow1.getCell('E').value = tongGioThucHien.toFixed(1);
  worksheet.mergeCells(`A${totalRow1.number}:D${totalRow1.number}`);
  const boldBorderStyle = { ...styles.bold, border: styles.tableBorder };
  applyStyle(totalRow1.getCell('A'), boldBorderStyle);
  applyStyle(totalRow1.getCell('B'), boldBorderStyle);
  applyStyle(totalRow1.getCell('C'), boldBorderStyle);
  applyStyle(totalRow1.getCell('D'), boldBorderStyle);
  applyStyle(totalRow1.getCell('E'), { ...boldBorderStyle, alignment: { horizontal: 'center' } });

  // Total rows for table 2
  const totalRow2_1 = worksheet.getRow(startSummaryRow + 1 + summaryData2.length);
  totalRow2_1.getCell('H').value = 'Tổng số giờ chính quy đã thực hiện trong năm';
  totalRow2_1.getCell('K').value = tongGioThucHien.toFixed(1);
  worksheet.mergeCells(`H${totalRow2_1.number}:J${totalRow2_1.number}`);
  applyStyle(totalRow2_1.getCell('H'), boldBorderStyle);
  applyStyle(totalRow2_1.getCell('I'), boldBorderStyle);
  applyStyle(totalRow2_1.getCell('J'), boldBorderStyle);
  applyStyle(totalRow2_1.getCell('K'), { ...boldBorderStyle, alignment: { horizontal: 'center' } });

  const totalRow2_2 = worksheet.getRow(startSummaryRow + 2 + summaryData2.length);
  totalRow2_2.getCell('H').value = 'Thừa/Thiếu giờ lao động chính quy';
  totalRow2_2.getCell('K').value = thuaThieuGio.toFixed(1);
  worksheet.mergeCells(`H${totalRow2_2.number}:J${totalRow2_2.number}`);
  applyStyle(totalRow2_2.getCell('H'), boldBorderStyle);
  applyStyle(totalRow2_2.getCell('I'), boldBorderStyle);
  applyStyle(totalRow2_2.getCell('J'), boldBorderStyle);
  applyStyle(totalRow2_2.getCell('K'), { ...boldBorderStyle, alignment: { horizontal: 'center' } });

  worksheet.addRow([]);

  // === 5. SIGNATURE ===
  const today = new Date();
  const signatureDate = `Đắk Lắk, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  const dateRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', signatureDate]);
  worksheet.mergeCells(`L${dateRow.number}:O${dateRow.number}`);
  applyStyle(dateRow.getCell('L'), { alignment: { horizontal: 'center', wrapText: true }, font: { italic: true, name: 'Times New Roman' } });

  const sigTitleRow = worksheet.addRow(['', 'TRƯỞNG KHOA', '', '', '', 'TRƯỞNG BỘ MÔN', '', '', '', '', 'NGƯỜI KÊ KHAI']);
  worksheet.mergeCells(`B${sigTitleRow.number}:D${sigTitleRow.number}`);
  worksheet.mergeCells(`F${sigTitleRow.number}:I${sigTitleRow.number}`);
  worksheet.mergeCells(`K${sigTitleRow.number}:N${sigTitleRow.number}`);
  applyStyle(sigTitleRow.getCell('B'), { ...styles.bold, ...styles.center });
  applyStyle(sigTitleRow.getCell('F'), { ...styles.bold, ...styles.center });
  applyStyle(sigTitleRow.getCell('K'), { ...styles.bold, ...styles.center });

  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  const sigNameRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', data.info.userInfo.username]);
  worksheet.mergeCells(`K${sigNameRow.number}:N${sigNameRow.number}`);
  applyStyle(sigNameRow.getCell('K'), { ...styles.bold, ...styles.center });


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
  console.log('exportHocPhan called with:', dataList); // Debug log

  if (!dataList || dataList.length === 0) {
    console.error('No data to export'); // Debug log
    alert('Không có dữ liệu để xuất!');
    return;
  }

  console.log('Starting export process...'); // Debug log

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
    console.log('Adding data rows, total items:', dataList.length); // Debug log
    dataList.forEach((item, idx) => {
      console.log(`Adding row ${idx + 1}:`, item); // Debug log
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
    console.log('Generating Excel buffer...'); // Debug log
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('Buffer created, size:', buffer.byteLength); // Debug log

    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;

    // Get current date for filename
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `DanhSachHocPhan_${dateStr}.xlsx`;
    anchor.download = filename;

    console.log('Downloading file:', filename); // Debug log
    document.body.appendChild(anchor); // Ensure anchor is in DOM
    anchor.click();
    document.body.removeChild(anchor); // Clean up
    window.URL.revokeObjectURL(url);
    console.log('Export completed successfully'); // Debug log

  } catch (error) {
    console.error('Error in exportHocPhan:', error);
    console.log('Falling back to CSV export...');
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
  const fileName = selectedKhoa
    ? `TKB_GiangDay_${selectedKhoa}_HK${hocKy}_${namHoc.replace("-", "_")}.xlsx`
    : `TKB_GiangDay_HK${hocKy}_${namHoc.replace("-", "_")}.xlsx`;
  anchor.download = fileName;
  anchor.click();
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

  // Thêm dữ liệu đúng key thực tế của pc-cham-thi
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      hocPhan: data.hocPhan || '',
      nhomLop: data.nhomLop || '',
      ngayThi: data.ngayThi || '',
      cb1: data.cb1 || '',
      cb2: data.cb2 || '',
      soBai: data.soBai || '',
      hinhThuc: data.hinhThuc || '',
      thoiGian: data.thoiGian || ''
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
    { header: 'Mã chức vụ', key: 'maCV', width: 35 },
    { header: 'Chức vụ / Công việc', key: 'chucVu', width: 35 },
    { header: 'Mã GV', key: 'maGV', width: 35 },
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
      maCV: data.chucVu?.maCV || '',

      chucVu: data.chucVu?.tenCV || '',
      maGV: data.user?.maGV || '',
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
  anchor.download = `DS_PhanCong_KiemNhiem.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const exportTongHopLaoDong = async (dataList, type, title, namHoc, selectedKhoa = '') => {
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
    // Tính lại các giá trị cần thiết
    const gioChuan = Number(data.gioChuan) || 0;
    const kiemNhiem = Number(data.kiemNhiem) || 0;
    const chuanNamHoc = gioChuan - kiemNhiem;
    const tongGiangDay = Number(data.congTacGiangDay?.tong) || 0;
    const tongCongTacKhac = Number(data.congTacKhac?.tong) || 0;
    const tongGioChinhQuy = tongGiangDay + tongCongTacKhac;
    const thuaThieuGioLaoDong = chuanNamHoc - tongGioChinhQuy;
    worksheet.addRow({
      stt: index + 1,
      username: data.user?.username ?? '',
      soTietLT: data.congTacGiangDay?.soTietLT ?? '',
      soTietTH: data.congTacGiangDay?.soTietTH ?? '',
      soTietQCLT: data.congTacGiangDay?.soTietQCLT ?? '',
      soTietQCTH: data.congTacGiangDay?.soTietQCTH ?? '',
      tongGiangDay: tongGiangDay,
      gioChuan: gioChuan,
      kiemNhiem: kiemNhiem,
      chuanNamHoc: chuanNamHoc,
      chamThi: data.congTacKhac?.chamThi ?? '',
      ngoaiKhoa: data.congTacKhac?.ngoaiKhoa ?? '',
      coiThi: data.congTacKhac?.coiThi ?? '',
      deThi: data.congTacKhac?.deThi ?? '',
      tongCongTacKhac: tongCongTacKhac,
      tongGioChinhQuy: tongGioChinhQuy,
      thuaThieuGioLaoDong: thuaThieuGioLaoDong
    });
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
  worksheet.mergeCells('D4:J4');     // Title
  worksheet.mergeCells('D5:J5');     // Năm học

  // Thêm dữ liệu
  dataList.forEach((data, index) => {
    worksheet.addRow({
      stt: index + 1,
      username: data.user?.username ?? '',
      soTietLT: data.congTacGiangDay?.soTietLT ?? '',
      soTietTH: data.congTacGiangDay?.soTietTH ?? '',
      soTietQCLT: data.congTacGiangDay?.soTietQCLT ?? '',
      soTietQCTH: data.congTacGiangDay?.soTietQCTH ?? '',
      tongGiangDay: data.congTacGiangDay?.tong ?? '',
      gioChuan: data.gioChuan ?? '',
      kiemNhiem: data.kiemNhiem ?? '',
      chuanNamHoc: data.chuanNamHoc ?? '',
      chamThi: data.congTacKhac?.chamThi ?? '',
      ngoaiKhoa: data.congTacKhac?.ngoaiKhoa ?? '',
      coiThi: data.congTacKhac?.coiThi ?? '',
      deThi: data.congTacKhac?.deThi ?? '',
      tongCongTacKhac: data.congTacKhac?.tong ?? '',
      tongGioChinhQuy: data.tongGioChinhQuy ?? '',
      thuaThieuGioLaoDong: data.thuaThieuGioLaoDong ?? ''
    });
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



