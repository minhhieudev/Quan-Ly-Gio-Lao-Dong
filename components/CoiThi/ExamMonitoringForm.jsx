"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Spin, Table, Tabs, Typography, Upload } from "antd";
import moment from 'moment';
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import Loader from "../Loader";
import TablePcCoiThi from "./TablePcCoiThi";

const { Title } = Typography;

const formSchema = {
    soTietQuyChuan: 0,
    ghiChu: "",
    hocPhan: '',
    thoiGianThi: '',
    ngayThi: ''
};


const ExamMonitoringForm = ({ onUpdateCongTacCoiThi, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [listSelect, setListSelect] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const { data: session } = useSession();
    const currentUser = session?.user;
    const [loading, setLoading] = useState(true);
    const { type } = useParams();

    const [selectedTab, setSelectedTab] = useState('Kết quả coi thi');
    const [loadings, setLoadings] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newHocPhan, setNewHocPhan] = useState([]);
    const [isImporting, setIsImporting] = useState(false);

    const [currentHocPhan, setCurrentHocPhan] = useState(null);
    const [showForm, setShowForm] = useState(true);

    const ngayThi = watch("ngayThi");
    const thoiGian = watch("thoiGianThi");

    useEffect(() => {
        let timeValue = thoiGian
        let gioChuan;
        if (currentHocPhan?.time && Array.isArray(currentHocPhan?.time) && currentHocPhan?.time.length > 0) {
            timeValue = currentHocPhan?.time.length > 1
                ? Math.max(...currentHocPhan?.time)
                : currentHocPhan?.time[0];
        }
        // ) Coi thi ngoài giờ hành chính (sau 17 giờ 00,  thứ Bảy, Chủ Nhật) hoặc coi thi ngoài trường: 01 giờ chuẩn được nhân hệ số 1,2.

        if (timeValue == 60) {
            gioChuan = 1;
        } else if (timeValue == 90) {
            gioChuan = 1.25;
        } else if (timeValue == 120) {
            gioChuan = 1.5;
        } else if (timeValue == 150) {
            gioChuan = 1.75;
        }

        // Kiểm tra nếu ngày thi rơi vào Thứ Bảy hoặc Chủ Nhật
        const ngayThiMoment = moment(ngayThi, "YYYY-MM-DD"); // Đảm bảo `ngayThi` đang ở định dạng YYYY-MM-DD
        const dayOfWeek = ngayThiMoment.day();

        if (dayOfWeek === 6 || dayOfWeek === 0) { // 6 là Thứ Bảy, 0 là Chủ Nhật
            gioChuan *= 1.2; // Nhân hệ số 1,2 nếu rơi vào ngoài giờ hành chính
        }

        setValue("soTietQuyChuan", gioChuan); // Cập nhật giá trị số tiết quy chuẩn vào form
    }, [ngayThi, currentHocPhan, thoiGian]);



    const handleAddNewClick = () => {
        setIsAddingNew(!isAddingNew);
    };

    const handleSaveNewHocPhan = () => {
        const newHocPhanObj = {
            _id: Math.random().toString(36).substr(2, 9),
            hocPhan: newHocPhan,
            ky: '',
            time: "",
            ngayThi: '',
        };

        // Cập nhật listSelect với học phần mới
        setListSelect([...listSelect, newHocPhanObj]);

        // Reset trạng thái thêm mới và input học phần
        setIsAddingNew(false);
        setNewHocPhan("");
    };


    const handleSelectChange = (setCurrentHocPhan) => {
        const selectedHocPhan = listSelect.find(item => item.hocPhan.join(', ') === setCurrentHocPhan);

        if (selectedHocPhan) {
            // Chuyển đổi định dạng ngày từ "DD-MM-YYYY" sang "YYYY-MM-DD"
            const [day, month, year] = selectedHocPhan.ngayThi.split('-');
            const formattedDate = `${year}-${month}-${day}`; // Định dạng lại thành "YYYY-MM-DD"

            setValue("ngayThi", formattedDate); // Lấy giá trị từ selectedHocPhan

            // Kiểm tra xem thoiGian có phải là mảng không trước khi sử dụng Math.max
            if (Array.isArray(selectedHocPhan.thoiGian) && selectedHocPhan.thoiGian.length > 0) {
                setValue("thoiGianThi", Math.max(...selectedHocPhan.thoiGian) || ''); // Lấy giá trị lớn nhất của mảng selectedHocPhan.thoiGian
            } else {
                setValue("thoiGianThi", ''); // Hoặc thiết lập giá trị mặc định nếu không phải là mảng
            }

            setValue("ghiChu", selectedHocPhan.ghiChu); // Đảm bảo bạn có trường này
        }
    };


    useEffect(() => {
        if (editRecord) {
            reset(editRecord);
        } else {
            reset(formSchema);
        }
    }, [editRecord, reset]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/work-hours/CongTacCoiThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDataList(data);
                    setLoading(false)
                    setLoadings(false)

                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (err) {
                toast.error("An error occurred while fetching data");
            }
        };

        fetchData();
    }, [namHoc]);

    // Định nghĩa fetchData bên ngoài useEffect để có thể gọi từ nhiều nơi
    const fetchData = async () => {

        if (!namHoc || !currentUser?.username) return;

        try {

            const res = await fetch(
                `/api/pc-coi-thi?namHoc=${namHoc}&userName=${encodeURIComponent(currentUser.username)}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            setListSelect(data);
        } catch (err) {
            console.log('error:', err);
            toast.error("An error occurred while fetching data");
        }
    };

    useEffect(() => {
        fetchData();
    }, [namHoc, currentUser?.name]);

    const calculateTotals = () => {
        onUpdateCongTacCoiThi(totalSoTietQuyChuan);
    };

    useEffect(() => {
        calculateTotals();
    }, [dataList]);

    const onSubmit = async (data) => {
        if (namHoc == '') {
            toast.error('Vui lòng nhập năm học!')
            return
        }
        try {
            // Tính lại số tiết quy chuẩn trước khi gửi lên server
            let gioChuan;
            const timeNum = Number(data.thoiGianThi);
            if (timeNum === 60) gioChuan = 1;
            else if (timeNum === 90) gioChuan = 1.25;
            else if (timeNum === 120) gioChuan = 1.5;
            else if (timeNum === 150) gioChuan = 1.75;
            else gioChuan = 1;

            // Kiểm tra cuối tuần
            const dayOfWeek = moment(data.ngayThi, "YYYY-MM-DD").day();
            if (dayOfWeek === 6 || dayOfWeek === 0) {
                gioChuan *= 1.2;
            }
            data.soTietQuyChuan = gioChuan;

            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/work-hours/CongTacCoiThi", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();

                if (editRecord || dataList.some(item => item.hocPhan === newData.hocPhan)) {
                    setDataList(prevData => prevData.map(item => (item.hocPhan === newData.hocPhan ? newData : item)));
                } else {
                    setDataList(prevData => [...prevData, newData]);
                }
                toast.success("Thêm mới thành công!");
                onReset(); // Reset form after success
            } else {
                toast.error("Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        }
    };
    const onReset = () => {
        reset(formSchema);
        setEditRecord(null);
    };

    // Hàm xử lý import Excel
    const handleImportExcel = async (file) => {
        setIsImporting(true);
        toast.loading('Đang import dữ liệu từ Excel...', { id: 'excel-import' });
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Tìm hàng header và dữ liệu
                    let headerRowIndex = -1;
                    let dataStartIndex = -1;

                    // Tìm loại kỳ thi và kỳ học từ toàn bộ file
                    let currentLoaiKyThi = '1'; // Mặc định
                    let initialLoaiKyThi = '1'; // LƯU GIÁ TRỊ BAN ĐẦU
                    let kyFromFile = ky; // Mặc định từ props
                    let foundKy = false;
                    let foundFirstDot = false; // QUAN TRỌNG: Chỉ lấy đợt đầu tiên

                    console.log('🔍 Starting to scan file for ky and FIRST dot only...');

                    // Scan toàn bộ file để tìm kỳ học và đợt đầu tiên
                    for (let i = 0; i < Math.min(15, jsonData.length); i++) {
                        const row = jsonData[i];
                        if (row && row.length > 0) {
                            const cellText = row.join(' ');
                            console.log(`📄 Header scan row ${i}:`, cellText);

                            // Tìm "kỳ" hoặc "Kỳ" theo sau bởi số - chỉ lấy lần đầu tiên
                            if (!foundKy) {
                                const kyMatch = cellText.match(/kỳ\s*(\d+)/i);
                                if (kyMatch) {
                                    kyFromFile = kyMatch[1];
                                    foundKy = true;
                                    console.log('✅ Detected ky from file:', kyFromFile, 'from row:', i);
                                }
                            }

                            // QUAN TRỌNG: Chỉ lấy đợt ĐẦU TIÊN trong header scan
                            if (!foundFirstDot) {
                                const lowerCellText = cellText.toLowerCase();
                                const isDotRowInHeader = (
                                    lowerCellText.includes('đợt kết thúc') ||
                                    lowerCellText.includes('đợt') && lowerCellText.includes('học phần') ||
                                    lowerCellText.includes('đợt') && lowerCellText.includes('2024-2025') ||
                                    lowerCellText.includes('đợt') && lowerCellText.includes('năm học') ||
                                    // THÊM: Nhận diện format "Đợt học kỳ X, đợt Y"
                                    lowerCellText.includes('đợt') && lowerCellText.includes('học kỳ') ||
                                    // THÊM: Nhận diện bất kỳ dòng nào chứa "đợt" và có số
                                    lowerCellText.includes('đợt') && /đợt\s*\d+/.test(lowerCellText)
                                );

                                if (isDotRowInHeader) {
                                    const dotMatches = cellText.match(/[Đđ]ợt\s*(\d+)/g);
                                    console.log(`🔍 CHECKING DOT in header scan row ${i}:`, cellText);
                                    console.log(`🔍 Dot matches found:`, dotMatches);

                                    if (dotMatches && dotMatches.length > 0) {
                                        const lastDotMatch = dotMatches[dotMatches.length - 1];
                                        const dotNumber = lastDotMatch.match(/(\d+)/)[1];
                                        console.log(`🎯 FOUND FIRST DOT in header scan row ${i}:`, cellText);
                                        console.log(`🔄 Setting initial loaiKyThi to "${dotNumber}" (from: ${lastDotMatch})`);
                                        currentLoaiKyThi = dotNumber;
                                        initialLoaiKyThi = dotNumber; // LƯU GIÁ TRỊ BAN ĐẦU
                                        foundFirstDot = true; // DỪNG TÌM KIẾM ĐỢT TIẾP THEO
                                    }
                                }
                            }
                        }
                    }

                    console.log('🎯 Initial values after header scan:', { currentLoaiKyThi, kyFromFile });
                    console.log('⚠️ Note: currentLoaiKyThi will be updated dynamically when processing data rows');

                    // Tìm hàng chứa "Tên học phần" để xác định header
                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row && row.some(cell => cell && cell.toString().includes('Tên học phần'))) {
                            headerRowIndex = i;
                            dataStartIndex = i + 1;
                            break;
                        }
                    }

                    if (headerRowIndex === -1) {
                        toast.error('Không tìm thấy header "Tên học phần" trong file Excel!');
                        toast.dismiss('excel-import');
                        return;
                    }

                    const headers = jsonData[headerRowIndex];

                    // Tìm các cột cần thiết
                    const columnIndexes = {
                        maHocPhan: headers.findIndex(h => h && h.toString().includes('Mã học phần')),
                        tenHocPhan: headers.findIndex(h => h && h.toString().includes('Tên học phần')),
                        lopHP: headers.findIndex(h => h && h.toString().includes('Lớp HP')),
                        ngayThi: headers.findIndex(h => h && h.toString().includes('Ngày thi')),
                        buoiThi: headers.findIndex(h => h && h.toString().includes('Buổi thi')),
                        gioThi: headers.findIndex(h => h && h.toString().includes('Giờ thi')),
                        thoiGianThi: headers.findIndex(h => h && (h.toString().includes('Thời gian thi') || h.toString().includes('Thời gian'))),
                        phongThi: headers.findIndex(h => h && h.toString().includes('Phòng thi')),
                        canBoGiangDay: headers.findIndex(h => h && h.toString().includes('Cán bộ giảng dạy')),
                        vaiTro: headers.findIndex(h => h && h.toString().includes('Vai trò'))
                    };

                    // Kiểm tra các cột bắt buộc
                    if (columnIndexes.tenHocPhan === -1 || columnIndexes.ngayThi === -1) {
                        toast.error('Không tìm thấy các cột cần thiết (Tên học phần, Ngày thi) trong file Excel!');
                        toast.dismiss('excel-import');
                        return;
                    }

                    console.log('Column indexes found:', columnIndexes);

                    // Xử lý dữ liệu
                    const importedData = [];
                    for (let i = dataStartIndex; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || row.length === 0) continue;

                        // Kiểm tra xem có phải dòng header với đợt không
                        const rowText = row.join(' ');
                        console.log(`🔍 Row ${i} (${row.length} cells):`, rowText);

                        // Debug: Hiển thị từng cell
                        if (rowText.toLowerCase().includes('đợt')) {
                            console.log(`🔍 Row ${i} contains 'đợt', cells:`, row.map((cell, idx) => `[${idx}]: "${cell}"`));
                        }

                        // Kiểm tra nếu dòng này chứa thông tin đợt - CẢI THIỆN LOGIC
                        const lowerRowText = rowText.toLowerCase();
                        const isDotRow = (
                            lowerRowText.includes('đợt kết thúc') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('học phần') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('2024-2025') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('năm học')
                        );

                        if (isDotRow) {
                            // Tìm số đợt trong dòng này - tìm tất cả các số sau "đợt"
                            const dotMatches = rowText.match(/[Đđ]ợt\s*(\d+)/g);
                            console.log(`🎯 FOUND DOT ROW at ${i}:`, rowText);
                            console.log(`🔍 Dot matches found:`, dotMatches);

                            if (dotMatches && dotMatches.length > 0) {
                                // Lấy số đợt cuối cùng (thường là đợt chính xác nhất)
                                const lastDotMatch = dotMatches[dotMatches.length - 1];
                                const dotNumber = lastDotMatch.match(/(\d+)/)[1];
                                console.log(`🔄 UPDATING loaiKyThi from "${currentLoaiKyThi}" to "${dotNumber}" (from: ${lastDotMatch})`);
                                currentLoaiKyThi = dotNumber;
                            }
                            continue; // Skip header row
                        }

                        // Kiểm tra dòng có dữ liệu thực không (skip dòng trống và header table)
                        const firstCell = row[0] ? row[0].toString().toLowerCase() : '';
                        const secondCell = row[1] ? row[1].toString().toLowerCase() : '';

                        if (!row[0] || !row[1] || firstCell === '' || secondCell === '') {
                            console.log(`⏭️ Skipping empty row ${i}`);
                            continue;
                        }

                        if (firstCell.includes('stt') || secondCell.includes('mã học phần') || secondCell.includes('tên học phần')) {
                            console.log(`⏭️ Skipping table header row ${i}:`, firstCell, secondCell);
                            continue;
                        }

                        // Đọc tất cả các cột
                        const rowData = {
                            maHocPhan: columnIndexes.maHocPhan !== -1 ? (row[columnIndexes.maHocPhan] || '') : '',
                            tenHocPhan: columnIndexes.tenHocPhan !== -1 ? (row[columnIndexes.tenHocPhan] || '') : '',
                            lopHP: columnIndexes.lopHP !== -1 ? (row[columnIndexes.lopHP] || '') : '',
                            ngayThi: columnIndexes.ngayThi !== -1 ? (row[columnIndexes.ngayThi] || '') : '',
                            buoiThi: columnIndexes.buoiThi !== -1 ? (row[columnIndexes.buoiThi] || '') : '',
                            gioThi: columnIndexes.gioThi !== -1 ? (row[columnIndexes.gioThi] || '') : '',
                            thoiGianThi: columnIndexes.thoiGianThi !== -1 ? (row[columnIndexes.thoiGianThi] || '') : '',
                            phongThi: columnIndexes.phongThi !== -1 ? (row[columnIndexes.phongThi] || '') : '',
                            canBoGiangDay: columnIndexes.canBoGiangDay !== -1 ? (row[columnIndexes.canBoGiangDay] || '') : '',
                            vaiTro: columnIndexes.vaiTro !== -1 ? (row[columnIndexes.vaiTro] || '') : ''
                        };

                        // Validate dữ liệu cơ bản
                        if (!rowData.tenHocPhan || rowData.tenHocPhan.toString().trim() === '') {
                            console.log(`⏭️ Skipping row ${i} - no tenHocPhan`);
                            continue;
                        }
                        if (!rowData.ngayThi) {
                            console.log(`⏭️ Skipping row ${i} - no ngayThi`);
                            continue;
                        }

                        console.log('Processing row data:', rowData);

                        if (rowData.tenHocPhan && rowData.ngayThi) {
                            // Xử lý ngày thi
                            let formattedNgayThi = '';
                            try {
                                if (typeof rowData.ngayThi === 'number') {
                                    // Excel date serial number
                                    const excelDate = new Date((rowData.ngayThi - 25569) * 86400 * 1000);
                                    if (!isNaN(excelDate.getTime())) {
                                        formattedNgayThi = excelDate.toISOString().split('T')[0];
                                    }
                                } else if (rowData.ngayThi instanceof Date) {
                                    if (!isNaN(rowData.ngayThi.getTime())) {
                                        formattedNgayThi = rowData.ngayThi.toISOString().split('T')[0];
                                    }
                                } else if (typeof rowData.ngayThi === 'string' && rowData.ngayThi.trim() !== '') {
                                    // Thử parse string date
                                    const parsedDate = new Date(rowData.ngayThi.trim());
                                    if (!isNaN(parsedDate.getTime())) {
                                        formattedNgayThi = parsedDate.toISOString().split('T')[0];
                                    } else {
                                        // Thử format dd/mm/yyyy hoặc dd-mm-yyyy
                                        const dateFormats = [
                                            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
                                            /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
                                        ];

                                        for (const format of dateFormats) {
                                            const match = rowData.ngayThi.trim().match(format);
                                            if (match) {
                                                let day, month, year;
                                                if (format === dateFormats[0]) { // dd/mm/yyyy
                                                    [, day, month, year] = match;
                                                } else { // yyyy/mm/dd
                                                    [, year, month, day] = match;
                                                }
                                                const testDate = new Date(year, month - 1, day);
                                                if (!isNaN(testDate.getTime())) {
                                                    formattedNgayThi = testDate.toISOString().split('T')[0];
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (dateError) {
                                console.warn('Error parsing date:', rowData.ngayThi, dateError);
                            }

                            // Skip nếu không parse được ngày
                            if (!formattedNgayThi) {
                                console.warn('Không thể parse ngày thi:', rowData.ngayThi);
                                continue;
                            }

                            // Tính soTietQuyChuan theo logic hiện tại
                            let soTietQuyChuan = calcSoTietQuyChuan(rowData.thoiGianThi, formattedNgayThi);

                            // Thêm vào importedData cho CongTacCoiThi
                            importedData.push({
                                hocPhan: rowData.tenHocPhan.toString().trim(),
                                ngayThi: formattedNgayThi,
                                thoiGianThi: rowData.thoiGianThi ? rowData.thoiGianThi.toString().trim() : '',
                                soTietQuyChuan: soTietQuyChuan,
                                ghiChu: '' // Để trống thay vì "Import từ Excel"
                            });
                        }
                    }

                    // Log kết quả importedData sau khi tính toán số tiết QC
                    console.log('importedData sau khi tính toán:', importedData);

                    if (importedData.length === 0) {
                        toast.error('Không có dữ liệu hợp lệ để import!');
                        toast.dismiss('excel-import');
                        return;
                    }

                    // Chuẩn bị dữ liệu cho PcCoiThi từ dữ liệu Excel đầy đủ
                    const pcCoiThiData = [];

                    // RESET currentLoaiKyThi về giá trị ban đầu cho vòng lặp thứ 2
                    currentLoaiKyThi = initialLoaiKyThi; // KHÔI PHỤC GIÁ TRỊ BAN ĐẦU
                    console.log(`🔄 RESET currentLoaiKyThi for PcCoiThi processing: "${currentLoaiKyThi}" (from initialLoaiKyThi: "${initialLoaiKyThi}")`);

                    // Xử lý lại từ jsonData để lấy đầy đủ thông tin
                    for (let i = dataStartIndex; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || row.length === 0) continue;

                        // Kiểm tra xem có phải dòng header với đợt không (GIỐNG VỚI VÒNG LẶP 1)
                        const rowText = row.join(' ');
                        console.log(`🔍 PcCoiThi Row ${i} (${row.length} cells):`, rowText);

                        // Debug: Hiển thị từng cell nếu chứa đợt
                        if (rowText.toLowerCase().includes('đợt')) {
                            console.log(`🔍 PcCoiThi Row ${i} contains 'đợt', cells:`, row.map((cell, idx) => `[${idx}]: "${cell}"`));
                        }

                        // Kiểm tra nếu dòng này chứa thông tin đợt - CẢI THIỆN LOGIC
                        const lowerRowText = rowText.toLowerCase();
                        const isDotRow = (
                            lowerRowText.includes('đợt kết thúc') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('học phần') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('2024-2025') ||
                            lowerRowText.includes('đợt') && lowerRowText.includes('năm học') ||
                            // THÊM: Nhận diện format "Đợt học kỳ X, đợt Y"
                            lowerRowText.includes('đợt') && lowerRowText.includes('học kỳ') ||
                            // THÊM: Nhận diện bất kỳ dòng nào chứa "đợt" và có số
                            lowerRowText.includes('đợt') && /đợt\s*\d+/.test(lowerRowText)
                        );

                        if (isDotRow) {
                            // Tìm số đợt trong dòng này - tìm tất cả các số sau "đợt"
                            const dotMatches = rowText.match(/[Đđ]ợt\s*(\d+)/g);
                            console.log(`🎯 FOUND DOT ROW in PcCoiThi at ${i}:`, rowText);
                            console.log(`🔍 Dot matches found:`, dotMatches);

                            if (dotMatches && dotMatches.length > 0) {
                                // Lấy số đợt cuối cùng (thường là đợt chính xác nhất)
                                const lastDotMatch = dotMatches[dotMatches.length - 1];
                                const dotNumber = lastDotMatch.match(/(\d+)/)[1];
                                console.log(`🔄 PcCoiThi UPDATING loaiKyThi from "${currentLoaiKyThi}" to "${dotNumber}" (from: ${lastDotMatch})`);
                                currentLoaiKyThi = dotNumber;
                            }
                            continue; // Skip header row
                        }

                        const rowData = {
                            maHocPhan: columnIndexes.maHocPhan !== -1 ? (row[columnIndexes.maHocPhan] || '') : '',
                            tenHocPhan: columnIndexes.tenHocPhan !== -1 ? (row[columnIndexes.tenHocPhan] || '') : '',
                            lopHP: columnIndexes.lopHP !== -1 ? (row[columnIndexes.lopHP] || '') : '',
                            ngayThi: columnIndexes.ngayThi !== -1 ? (row[columnIndexes.ngayThi] || '') : '',
                            buoiThi: columnIndexes.buoiThi !== -1 ? (row[columnIndexes.buoiThi] || '') : '',
                            gioThi: columnIndexes.gioThi !== -1 ? (row[columnIndexes.gioThi] || '') : '',
                            thoiGianThi: columnIndexes.thoiGianThi !== -1 ? (row[columnIndexes.thoiGianThi] || '') : '',
                            phongThi: columnIndexes.phongThi !== -1 ? (row[columnIndexes.phongThi] || '') : '',
                            canBoGiangDay: columnIndexes.canBoGiangDay !== -1 ? (row[columnIndexes.canBoGiangDay] || '') : '',
                            vaiTro: columnIndexes.vaiTro !== -1 ? (row[columnIndexes.vaiTro] || '') : ''
                        };

                        // Skip empty rows
                        if (!rowData.tenHocPhan && !rowData.maHocPhan) {
                            console.log(`⏭️ Skipping empty PcCoiThi row ${i}`);
                            continue;
                        }

                        // Skip table header rows
                        const lowerRowData = rowData.tenHocPhan.toString().toLowerCase();
                        if (lowerRowData.includes('stt') || lowerRowData.includes('mã học phần') || lowerRowData.includes('tên học phần')) {
                            console.log(`⏭️ Skipping table header PcCoiThi row ${i}:`, lowerRowData);
                            continue;
                        }

                        if (!rowData.tenHocPhan || !rowData.ngayThi) {
                            console.log(`⏭️ Skipping PcCoiThi row ${i} - missing tenHocPhan or ngayThi`);
                            continue;
                        }

                        // Xử lý ngày thi cho PcCoiThi
                        let formattedNgayThi = '';
                        try {
                            if (typeof rowData.ngayThi === 'number') {
                                const excelDate = new Date((rowData.ngayThi - 25569) * 86400 * 1000);
                                if (!isNaN(excelDate.getTime())) {
                                    formattedNgayThi = excelDate.toISOString().split('T')[0];
                                }
                            } else if (rowData.ngayThi instanceof Date) {
                                if (!isNaN(rowData.ngayThi.getTime())) {
                                    formattedNgayThi = rowData.ngayThi.toISOString().split('T')[0];
                                }
                            } else if (typeof rowData.ngayThi === 'string' && rowData.ngayThi.trim() !== '') {
                                const parsedDate = new Date(rowData.ngayThi.trim());
                                if (!isNaN(parsedDate.getTime())) {
                                    formattedNgayThi = parsedDate.toISOString().split('T')[0];
                                } else {
                                    const dateFormats = [
                                        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
                                        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
                                    ];

                                    for (const format of dateFormats) {
                                        const match = rowData.ngayThi.trim().match(format);
                                        if (match) {
                                            let day, month, year;
                                            if (format === dateFormats[0]) {
                                                [, day, month, year] = match;
                                            } else {
                                                [, year, month, day] = match;
                                            }
                                            const testDate = new Date(year, month - 1, day);
                                            if (!isNaN(testDate.getTime())) {
                                                formattedNgayThi = testDate.toISOString().split('T')[0];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (dateError) {
                            console.warn('Error parsing date for PcCoiThi:', rowData.ngayThi, dateError);
                        }

                        if (!formattedNgayThi) continue;

                        // Xác định ca thi từ buổi thi hoặc giờ thi
                        let ca = '1'; // Mặc định sáng
                        if (rowData.buoiThi) {
                            const buoiStr = rowData.buoiThi.toString().toLowerCase();
                            if (buoiStr.includes('chiều') || buoiStr.includes('afternoon')) {
                                ca = '2';
                            }
                        }

                        // Xử lý cbo1/cbo2 dựa trên vai trò
                        let cbo1 = [];
                        let cbo2 = [];

                        if (rowData.vaiTro) {
                            const vaiTroStr = rowData.vaiTro.toString().toLowerCase();
                            const currentUsername = currentUser?.username || currentUser?.name || '';

                            if (vaiTroStr.includes('cán bộ coi thi 2') || vaiTroStr.includes('cbo2')) {
                                cbo2 = [currentUsername];
                                cbo1 = []; // Để trống
                            } else {
                                // Mặc định là cbo1 (bao gồm "Cán bộ coi thi", "Cán bộ coi thi 1", v.v.)
                                cbo1 = [currentUsername];
                                cbo2 = []; // Để trống
                            }
                        } else {
                            // Nếu không có vai trò, mặc định là cbo1
                            cbo1 = [currentUser?.username || currentUser?.name || ''];
                            cbo2 = [];
                        }

                        const itemData = {
                            maHocPhan: rowData.maHocPhan.toString().trim(),
                            hocPhan: [rowData.tenHocPhan.toString().trim()],
                            lop: rowData.lopHP ? [rowData.lopHP.toString().trim()] : [],
                            ngayThi: formattedNgayThi,
                            ca: ca,
                            phong: rowData.phongThi ? [rowData.phongThi.toString().trim()] : [],
                            cbo1: cbo1,
                            cbo2: cbo2,
                            hinhThuc: [], // Để trống
                            thoiGian: rowData.thoiGianThi ? [rowData.thoiGianThi.toString().trim()] : [],
                            loaiKyThi: currentLoaiKyThi,
                            type: type === 'chinh-quy' ? 'chinh-quy' : 'lien-thong-vlvh',
                            namHoc: namHoc,
                            ky: kyFromFile
                        };

                        console.log(`📝 Creating item at row ${i}:`, {
                            tenHocPhan: rowData.tenHocPhan,
                            currentLoaiKyThi: currentLoaiKyThi,
                            itemLoaiKyThi: itemData.loaiKyThi,
                            shouldMatch: currentLoaiKyThi === itemData.loaiKyThi,
                            rowText: row.join(' ').substring(0, 50) + '...'
                        });

                        if (currentLoaiKyThi !== itemData.loaiKyThi) {
                            console.error('❌ MISMATCH: currentLoaiKyThi !== itemData.loaiKyThi');
                            console.error('❌ This should not happen! Check logic above.');
                        }

                        // Đặc biệt debug cho Lập trình Python
                        if (rowData.tenHocPhan && rowData.tenHocPhan.toString().includes('Lập trình Python')) {
                            console.log('🐍 PYTHON DEBUG:', {
                                tenHocPhan: rowData.tenHocPhan,
                                currentLoaiKyThi: currentLoaiKyThi,
                                finalLoaiKyThi: itemData.loaiKyThi,
                                rowIndex: i
                            });
                        }

                        pcCoiThiData.push(itemData);
                    }

                    console.log('PcCoiThi data prepared:', pcCoiThiData);

                    // Gọi cả 2 API song song
                    try {
                        const [congTacRes, pcCoiThiRes] = await Promise.all([
                            // API 1: CongTacCoiThi
                            fetch("/api/work-hours/CongTacCoiThi/bulk-import", {
                                method: "POST",
                                body: JSON.stringify({
                                    items: importedData,
                                    type: type,
                                    user: currentUser._id,
                                    namHoc,
                                    ky: kyFromFile
                                }),
                                headers: { "Content-Type": "application/json" },
                            }),
                            // API 2: PcCoiThi
                            fetch("/api/pc-coi-thi/bulk-import", {
                                method: "POST",
                                body: JSON.stringify({
                                    items: pcCoiThiData,
                                    type: type === 'chinh-quy' ? 'chinh-quy' : 'lien-thong-vlvh',
                                    namHoc,
                                    ky: kyFromFile
                                }),
                                headers: { "Content-Type": "application/json" },
                            })
                        ]);

                        let successMessage = '';
                        let hasError = false;

                        // Xử lý kết quả CongTacCoiThi
                        if (congTacRes.ok) {
                            const congTacData = await congTacRes.json();
                            const { results } = congTacData;

                            // Thêm các bản ghi mới vào danh sách
                            if (results.success && results.success.length > 0) {
                                setDataList(prevData => {
                                    const newRecords = results.success.filter(newRecord =>
                                        !prevData.some(existing =>
                                            existing.hocPhan === newRecord.hocPhan &&
                                            existing.ngayThi === newRecord.ngayThi &&
                                            existing.user === newRecord.user
                                        )
                                    );
                                    return [...prevData, ...newRecords];
                                });
                            }

                            successMessage += `Công tác coi thi: ${congTacData.message}`;
                        } else {
                            hasError = true;
                            const errorText = await congTacRes.text();
                            console.error('CongTacCoiThi API Error:', errorText);
                        }

                        // Xử lý kết quả PcCoiThi
                        if (pcCoiThiRes.ok) {
                            const pcCoiThiData = await pcCoiThiRes.json();
                            successMessage += `\nPhân công coi thi: ${pcCoiThiData.message}`;
                        } else {
                            hasError = true;
                            const errorText = await pcCoiThiRes.text();
                            console.error('PcCoiThi API Error:', errorText);
                        }

                        // Hiển thị thông báo kết quả
                        if (hasError) {
                            toast.error('Import một phần thành công. Kiểm tra console để xem chi tiết lỗi.');
                        } else {
                            toast.success(successMessage);
                        }
                        toast.dismiss('excel-import');

                        // Refresh data sau khi import thành công
                        if (onUpdateCongTacCoiThi) {
                            onUpdateCongTacCoiThi();
                        }

                        // Refresh table data
                        fetchData();

                    } catch (err) {
                        console.error('Bulk import Error:', err);
                        toast.error('Lỗi khi import: ' + err.message);
                        toast.dismiss('excel-import');
                    }

                } catch (error) {
                    console.error('Error processing Excel file:', error);
                    toast.error('Lỗi khi xử lý file Excel!');
                    toast.dismiss('excel-import');
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error importing Excel:', error);
            toast.error('Lỗi khi import file Excel!');
            toast.dismiss('excel-import');
        } finally {
            setIsImporting(false);
        }
        return false; // Prevent upload
    };

    // Thêm hàm tính số tiết quy chuẩn dùng chung
    function calcSoTietQuyChuan(thoiGianThi, ngayThi) {
        let gioChuan;
        const timeNum = Number(thoiGianThi);
        if (timeNum === 60) gioChuan = 1;
        else if (timeNum === 90) gioChuan = 1.25;
        else if (timeNum === 120) gioChuan = 1.5;
        else if (timeNum === 150) gioChuan = 1.75;
        else gioChuan = 1;

        // Kiểm tra cuối tuần
        const dayOfWeek = moment(ngayThi, "YYYY-MM-DD").day();
        if (dayOfWeek === 6 || dayOfWeek === 0) {
            gioChuan *= 1.2;
        }
        return gioChuan;
    }

    const handleEdit = (record) => {
        console.log('record:', record);

        // Đổ dữ liệu vào form
        setValue("user", record.user);
        setValue("ky", record.ky);
        setValue("hocPhan", record.hocPhan);
        setValue("thoiGianThi", record.thoiGianThi);
        setValue("soTietQuyChuan", record.soTietQuyChuan);

        // Đảm bảo rằng ngayThi được thiết lập đúng cách
        setValue("ngayThi", new Date(record.ngayThi).toISOString().split('T')[0]); // Chuyển đổi định dạng ngày
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/work-hours/CongTacCoiThi", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setDataList(prevData => prevData.filter(item => item._id !== id));
                toast.success("Xóa thành công");
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const handleDeleteAccount = async (email) => {
        try {
            // Kiểm tra xem tài khoản có tồn tại
            const existingUser = await User.findOne({ email: email }); // Thay đổi theo cách bạn truy vấn người dùng

            if (existingUser) {
                // Nếu tài khoản tồn tại, thực hiện xóa
                await User.deleteOne({ email: email }); // Thay đổi theo cách bạn xóa người dùng
            } else {
                console.log('Tài khoản không tồn tại');
            }
        } catch (error) {
            console.error("Lỗi khi xóa tài khoản:", error);
        }
    };

    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record) => record._id === editingKey;

    const edit = (record) => {
        let soTietQuyChuan = record.soTietQuyChuan;
        console.log('Edit record:', record);
        if (
            (soTietQuyChuan === undefined || soTietQuyChuan === null || soTietQuyChuan === '') &&
            record.thoiGianThi && record.ngayThi
        ) {
            soTietQuyChuan = calcSoTietQuyChuan(record.thoiGianThi, record.ngayThi);
            console.log('Auto-calc soTietQuyChuan:', soTietQuyChuan);
        }
        form.setFieldsValue({
            ...record,
            soTietQuyChuan: soTietQuyChuan !== undefined && soTietQuyChuan !== null && soTietQuyChuan !== ''
                ? Number(soTietQuyChuan)
                : undefined
        });
        setEditingKey(record._id);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            // Tính lại số tiết quy chuẩn khi lưu
            row.soTietQuyChuan = calcSoTietQuyChuan(row.thoiGianThi, row.ngayThi);
            const newData = [...dataList];
            const index = newData.findIndex((item) => key === item._id);
            if (index > -1) {
                const item = newData[index];
                // Gọi API cập nhật
                const res = await fetch("/api/work-hours/CongTacCoiThi", {
                    method: "PUT",
                    body: JSON.stringify({ ...item, ...row, id: key, type: type, user: currentUser._id, namHoc, ky }),
                    headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                    const updated = await res.json();
                    newData.splice(index, 1, { ...item, ...updated });
                    setDataList(newData);
                    setEditingKey('');
                    toast.success("Cập nhật thành công!");
                } else {
                    toast.error("Cập nhật thất bại!");
                }
            } else {
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: <span className="font-semibold">Học phần</span>,
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            render: (text, record) => {
                return isEditing(record) ? (
                    <Form.Item
                        name="hocPhan"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    <span className="text-green-600 font-medium">{text}</span>
                );
            },
            width: '25%',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Kỳ</span>,
            dataIndex: 'ky',
            key: 'ky',
            render: (text) => <span className="font-medium">{text}</span>,
            width: '8%',
            align: 'center',
        },
        {
            title: <span className="font-semibold">Thời gian (phút)</span>,
            dataIndex: 'thoiGianThi',
            key: 'thoiGianThi',
            render: (text, record) => {
                return isEditing(record) ? (
                    <Form.Item
                        name="thoiGianThi"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Select
                            options={[
                                { value: '45', label: '45' },
                                { value: '60', label: '60' },
                                { value: '90', label: '90' },
                                { value: '120', label: '120' },
                                { value: '180', label: '180' }
                            ]}
                        />
                    </Form.Item>
                ) : (
                    <span className="font-medium">{text}</span>
                );
            },
            width: '10%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Ngày thi</span>,
            dataIndex: 'ngayThi',
            key: 'ngayThi',
            render: (text, record) => {
                return isEditing(record) ? (
                    <Form.Item
                        name="ngayThi"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                ) : (
                    <span className="font-medium">{moment(text).format('DD-MM-YYYY')}</span>
                );
            },
            width: '15%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Số tiết QC</span>,
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            render: (text, record) => {
                return isEditing(record) ? (
                    <Form.Item
                        name="soTietQuyChuan"
                        style={{ margin: 0 }}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                ) : (
                    <span className="text-blue-600 font-bold">{text}</span>
                );
            },
            width: '12%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Ghi chú</span>,
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '18%',
            ellipsis: true,
            render: (text, record) => isEditing(record) ? (
                <Form.Item name="ghiChu" style={{ margin: 0 }}>
                    <Input />
                </Form.Item>
            ) : (text ? <span className="text-gray-700">{text}</span> : null)
        },
        {
            title: <span className="font-semibold">Hành động</span>,
            key: 'action',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button type="link" onClick={() => save(record._id)} style={{ marginRight: 8 }}>Lưu</Button>
                        <Button type="link" onClick={cancel}>Hủy</Button>
                    </span>
                ) : (
                    <Space size="small">
                        <Button
                            onClick={() => edit(record)}
                            size="small"
                            type="primary"
                            className="bg-blue-500 hover:bg-blue-600"
                            icon={<EditOutlined />}
                            disabled={editingKey !== ''}
                            title="Sửa"
                        />
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xoá?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="primary"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={editingKey !== ''}
                                title="Xóa"
                            />
                        </Popconfirm>
                    </Space>
                );
            },
            width: '15%',
            align: 'center'
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleTabChange = (key) => {
        setLoadings(true);
        setSelectedTab(key);
        setTimeout(() => {
            setLoadings(false);
        }, 500);
    };

    // Tính tổng số tiết quy chuẩn
    const totalSoTietQuyChuan = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);


    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col h-full overflow-hidden">
            {showForm && (
                <div className="flex flex-col flex-[30%]">
                    <Button
                        onClick={() => setShowForm(v => !v)}
                        className="mb-4 w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg h-10 shadow-sm transition duration-200"
                    >
                        <span className="flex items-center justify-center">
                            Ẩn Form
                        </span>
                    </Button>
                    <div className="p-6 shadow-lg bg-white rounded-xl border border-gray-200 overflow-auto">
                        <div className="border-b border-blue-500 pb-3 mb-4">
                            <Title className="text-center text-blue-600 !mb-0" level={4}>CÔNG TÁC COI THI</Title>
                        </div>
                        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-4">
                            <Space direction="vertical" className="w-full" size={0}>
                                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                                    {!isAddingNew && (
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-base text-gray-700">
                                                    Học phần coi thi <span className="text-red-600">*</span>
                                                </span>
                                            }
                                            className="mb-2"
                                            validateStatus={errors.hocPhan ? 'error' : ''}
                                            help={errors.hocPhan?.message}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow">
                                                    <Controller
                                                        name="hocPhan"
                                                        control={control}
                                                        rules={{ required: "Học phần là bắt buộc" }}
                                                        render={({ field }) => (
                                                            <Select
                                                                showSearch
                                                                allowClear
                                                                className="w-full"
                                                                placeholder="Nhập hoặc chọn tên học phần..."
                                                                {...field}
                                                                options={listSelect.map((item, index) => ({
                                                                    value: Array.isArray(item.hocPhan) ? item.hocPhan.join(', ') : item.hocPhan,
                                                                    label: Array.isArray(item.hocPhan) ? item.hocPhan.join(', ') : item.hocPhan,
                                                                    key: `${item.hocPhan[0]}-${index}`
                                                                }))}
                                                                dropdownStyle={{ width: '400px' }}
                                                                filterOption={(input, option) =>
                                                                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                }
                                                                onChange={(value) => {
                                                                    field.onChange(value);
                                                                    handleSelectChange(value);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={handleAddNewClick}
                                                    className="flex-shrink-0 bg-blue-50 hover:bg-blue-100"
                                                    title="Thêm học phần mới"
                                                />
                                            </div>
                                        </Form.Item>
                                    )}
                                    {isAddingNew && (
                                        <Form.Item
                                            label={<span className="font-semibold text-base text-gray-700">Thêm học phần mới</span>}
                                            className="mb-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={newHocPhan}
                                                    onChange={(e) => setNewHocPhan(e.target.value.split(','))}
                                                    placeholder="Nhập tên học phần mới..."
                                                    className="flex-grow rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={handleSaveNewHocPhan}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Lưu
                                                </Button>
                                                <Button
                                                    onClick={handleAddNewClick}
                                                    className="border-gray-300 hover:border-red-500 hover:text-red-500"
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        </Form.Item>
                                    )}
                                </div>
                                {/* <Form.Item
                                    label={<span className="font-bold text-xl">Học kỳ <span className="text-red-600">*</span></span>}
                                    className="w-[40%]"
                                    validateStatus={errors.ky ? 'error' : ''}
                                    help={errors.ky?.message}
                                >
                                    <Controller
                                        name="ky"
                                        control={control}
                                        rules={{ required: "Học kỳ là bắt buộc" }}
                                        render={({ field }) => (
                                            <Radio.Group {...field} className="font-semibold">
                                                <Radio value="1">Kỳ 1</Radio>
                                                <Radio value="2">Kỳ 2</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </Form.Item> */}

                                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <Form.Item
                                            label={<span className="font-semibold text-base text-gray-700">Thời gian thi (Phút) <span className="text-red-600">*</span></span>}
                                            className="w-full md:w-1/2 mb-2"
                                        >
                                            <Controller
                                                name="thoiGianThi"
                                                control={control}
                                                rules={{ required: "Thời gian thi là bắt buộc" }}
                                                render={({ field }) =>
                                                    <Select
                                                        placeholder="Chọn thời gian thi..."
                                                        allowClear
                                                        className="w-full"
                                                        {...field}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                        }}
                                                        options={[
                                                            { value: '45', label: '45' },
                                                            { value: '60', label: '60' },
                                                            { value: '90', label: '90' },
                                                            { value: '120', label: '120' },
                                                            { value: '180', label: '180' }
                                                        ]}
                                                    />
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-semibold text-base text-gray-700">Ngày thi <span className="text-red-600">*</span></span>}
                                            className="w-full md:w-1/2 mb-2"
                                        >
                                            <Controller
                                                name="ngayThi"
                                                control={control}
                                                rules={{ required: "Ngày thi là bắt buộc" }}
                                                render={({ field }) =>
                                                    <Input
                                                        className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                        type="date"
                                                        {...field}
                                                    />
                                                }
                                            />
                                        </Form.Item>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                                    <div className="flex justify-between items-start gap-2 flex-wrap">
                                        <Form.Item
                                            label={<span className="font-semibold text-base text-gray-700">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                            className="w-full md:w-[48%] mb-2"
                                            validateStatus={errors.soTietQuyChuan ? 'error' : ''}
                                            help={errors.soTietQuyChuan?.message}
                                        >
                                            <Controller
                                                name="soTietQuyChuan"
                                                control={control}
                                                rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                                render={({ field }) =>
                                                    <InputNumber
                                                        className="w-full rounded-md border-gray-300 text-red-600 font-medium"
                                                        min={1}
                                                        {...field}
                                                    />
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-semibold text-base text-gray-700">Ghi chú</span>}
                                            className="w-full md:w-[48%] mb-2"
                                        >
                                            <Controller
                                                name="ghiChu"
                                                control={control}
                                                render={({ field }) =>
                                                    <Input.TextArea
                                                        className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                        placeholder="Nhập ghi chú nếu cần..."
                                                        autoSize={{ minRows: 2, maxRows: 3 }}
                                                        style={{ resize: 'none' }}
                                                        {...field}
                                                    />
                                                }
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <Space size="middle">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 h-8 px-6 font-medium text-base"
                                        >
                                            {isSubmitting ? "Đang xử lý..." : (editRecord ? "Cập nhật" : "Lưu")}
                                        </Button>
                                        <Button
                                            type="default"
                                            danger
                                            onClick={onReset}
                                            disabled={isSubmitting}
                                            className="h-8 px-6 font-medium text-base"
                                        >
                                            Làm mới
                                        </Button>
                                        <Upload
                                            accept=".xlsx,.xls"
                                            beforeUpload={handleImportExcel}
                                            showUploadList={false}
                                        >
                                            <Button
                                                type="default"
                                                loading={isImporting}
                                                disabled={isSubmitting || isImporting}
                                                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 h-8 px-6 font-medium text-base"
                                                icon={<UploadOutlined />}
                                            >
                                                {isImporting ? "Đang import..." : "Import Excel"}
                                            </Button>
                                        </Upload>
                                    </Space>
                                </div>
                            </Space>
                        </Form>
                    </div>
                </div>
            )}
            {!showForm && (
                <div className="flex flex-col flex-[0%]">
                    <Button onClick={() => setShowForm(v => !v)} className="mb-2 w-full">
                        Hiện Form
                    </Button>
                </div>
            )}
            <div className={`p-6 shadow-lg bg-white rounded-xl text-center border border-gray-200 overflow-y-auto transition-all duration-300 ${showForm ? 'flex-[75%]' : 'flex-[100%] w-full'}`}>
                <Tabs
                    activeKey={selectedTab}
                    onChange={handleTabChange}
                    type="card"
                    className="custom-tabs"
                    items={[
                        {
                            key: 'Kết quả coi thi',
                            label: <span className="font-semibold text-base">KẾT QUẢ COI THI</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <Form
                                    form={form}
                                    component={false}
                                    onValuesChange={(changed, all) => {
                                        const thoiGian = all.thoiGianThi;
                                        const ngayThi = all.ngayThi;
                                        console.log('onValuesChange:', { thoiGian, ngayThi });
                                        if (thoiGian && ngayThi) {
                                            const thqc = calcSoTietQuyChuan(thoiGian, ngayThi);
                                            console.log('Auto-calc on change:', thqc);
                                            form.setFieldsValue({ soTietQuyChuan: thqc });
                                        } else {
                                            form.setFieldsValue({ soTietQuyChuan: undefined });
                                        }
                                    }}
                                >
                                    <Table
                                        columns={columns}
                                        dataSource={dataList}
                                        pagination={{
                                            current,
                                            pageSize,
                                            total: dataList.length,
                                            onChange: handleTableChange,
                                            showSizeChanger: true,
                                            pageSizeOptions: ['5', '10', '20'],
                                            showTotal: (total) => `Tổng cộng ${total} bản ghi`
                                        }}
                                        bordered
                                        size="middle"
                                        className="custom-table"
                                        rowKey="_id"
                                    />
                                </Form>
                        },
                        {
                            key: 'Phân công coi thi',
                            label: <span className="font-semibold text-base">PHÂN CÔNG COI THI</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <TablePcCoiThi
                                    namHoc={namHoc || ''}
                                    ky={ky || ''}
                                    listSelect={listSelect || []}
                                />
                        }
                    ]}
                />

            </div>
        </div>
    );
};

export default ExamMonitoringForm;
