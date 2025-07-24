"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Radio, Table, Popconfirm, Tabs, Spin, Select, Upload } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import moment from 'moment';
import { useParams } from "next/navigation";
import Loader from "../Loader";
import TablePcCoiThi from "./TablePcCoiThi";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    soTietQuyChuan: 0,
    ghiChu: "",
    hocPhan: '',
    thoiGianThi: '',
    ngayThi: ''
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const ExamMonitoringForm = ({ onUpdateCongTacCoiThi, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [listSelect, setListSelect] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(6);
    const router = useRouter();
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

    const soTietQC = watch("soTietQuyChuan");
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
                const res = await fetch(`/api/work-hours/CongTacCoiThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}&ky=${ky}`, {
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
    }, [namHoc, ky]);

    useEffect(() => {
        if (!namHoc && !ky) return;

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pc-coi-thi?namHoc=${namHoc}&hocKy=${ky}&gvGiangDay=${currentUser.username}`,
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


        fetchData();
    }, [namHoc, ky]);

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
                    const hocPhanIndex = headers.findIndex(h => h && h.toString().includes('Tên học phần'));
                    const ngayThiIndex = headers.findIndex(h => h && h.toString().includes('Ngày thi'));
                    const thoiGianIndex = headers.findIndex(h => h && h.toString().includes('Thời gian thi'));

                    if (hocPhanIndex === -1 || ngayThiIndex === -1) {
                        toast.error('Không tìm thấy các cột cần thiết trong file Excel!');
                        toast.dismiss('excel-import');
                        return;
                    }

                    // Xử lý dữ liệu
                    const importedData = [];
                    for (let i = dataStartIndex; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || row.length === 0) continue;

                        const hocPhan = row[hocPhanIndex];
                        const ngayThi = row[ngayThiIndex];
                        const thoiGianThi = row[thoiGianIndex];

                        // Validate dữ liệu cơ bản
                        if (!hocPhan || hocPhan.toString().trim() === '') continue;
                        if (!ngayThi) continue;

                        if (hocPhan && ngayThi) {
                            // Xử lý ngày thi
                            let formattedNgayThi = '';
                            try {
                                if (typeof ngayThi === 'number') {
                                    // Excel date serial number
                                    const excelDate = new Date((ngayThi - 25569) * 86400 * 1000);
                                    if (!isNaN(excelDate.getTime())) {
                                        formattedNgayThi = excelDate.toISOString().split('T')[0];
                                    }
                                } else if (ngayThi instanceof Date) {
                                    if (!isNaN(ngayThi.getTime())) {
                                        formattedNgayThi = ngayThi.toISOString().split('T')[0];
                                    }
                                } else if (typeof ngayThi === 'string' && ngayThi.trim() !== '') {
                                    // Thử parse string date
                                    const parsedDate = new Date(ngayThi.trim());
                                    if (!isNaN(parsedDate.getTime())) {
                                        formattedNgayThi = parsedDate.toISOString().split('T')[0];
                                    } else {
                                        // Thử format dd/mm/yyyy hoặc dd-mm-yyyy
                                        const dateFormats = [
                                            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
                                            /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
                                        ];

                                        for (const format of dateFormats) {
                                            const match = ngayThi.trim().match(format);
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
                                console.warn('Error parsing date:', ngayThi, dateError);
                            }

                            // Skip nếu không parse được ngày
                            if (!formattedNgayThi) {
                                console.warn('Không thể parse ngày thi:', ngayThi);
                                continue;
                            }

                            // Tính soTietQuyChuan theo logic hiện tại
                            let soTietQuyChuan = 1;
                            try {
                                if (thoiGianThi) {
                                    const thoiGianStr = thoiGianThi.toString().trim();
                                    // Trích xuất số từ string (ví dụ: "120 phút" -> 120)
                                    const thoiGianNumber = parseInt(thoiGianStr.replace(/[^\d]/g, ''));
                                    if (!isNaN(thoiGianNumber) && thoiGianNumber > 0) {
                                        soTietQuyChuan = Math.max(1, Math.ceil(thoiGianNumber / 60));
                                    }
                                }
                            } catch (timeError) {
                                console.warn('Error parsing time:', thoiGianThi, timeError);
                            }

                            importedData.push({
                                hocPhan: hocPhan.toString().trim(),
                                ngayThi: formattedNgayThi,
                                thoiGianThi: thoiGianThi ? thoiGianThi.toString().trim() : '',
                                soTietQuyChuan: soTietQuyChuan,
                                ghiChu: '' // Để trống thay vì "Import từ Excel"
                            });
                        }
                    }

                    if (importedData.length === 0) {
                        toast.error('Không có dữ liệu hợp lệ để import!');
                        toast.dismiss('excel-import');
                        return;
                    }

                    // Gọi API bulk import
                    try {
                        const res = await fetch("/api/work-hours/CongTacCoiThi/bulk-import", {
                            method: "POST",
                            body: JSON.stringify({
                                items: importedData,
                                type: type,
                                user: currentUser._id,
                                namHoc,
                                ky
                            }),
                            headers: { "Content-Type": "application/json" },
                        });

                        if (res.ok) {
                            const responseData = await res.json();
                            const { results } = responseData;

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

                            // Hiển thị thông báo kết quả
                            toast.success(responseData.message);
                            toast.dismiss('excel-import');

                            // Log chi tiết nếu có lỗi
                            if (results.errors && results.errors.length > 0) {
                                console.warn('Import errors:', results.errors);
                            }
                            if (results.duplicates && results.duplicates.length > 0) {
                                console.info('Duplicate records:', results.duplicates);
                            }

                        } else {
                            const errorText = await res.text();
                            console.error('Bulk import API Error:', errorText);
                            toast.error('Import thất bại: ' + errorText);
                            toast.dismiss('excel-import');
                        }
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

    const columns = [
        {
            title: <span className="font-semibold">Học phần</span>,
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            render: (text) => <span className="text-green-600 font-medium">{text}</span>,
            width: '30%',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Thời gian (phút)</span>,
            dataIndex: 'thoiGianThi',
            key: 'thoiGianThi',
            render: (text) => <span className="font-medium">{text}</span>,
            width: '10%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Ngày thi</span>,
            dataIndex: 'ngayThi',
            key: 'ngayThi',
            render: (text) => <span className="font-medium">{moment(text).format('DD-MM-YYYY')}</span>,
            width: '15%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Số tiết QC</span>,
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            render: (text) => <span className="text-blue-600 font-bold">{text}</span>,
            width: '12%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Ghi chú</span>,
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '18%',
            ellipsis: true,
            render: (text) => text ? <span className="text-gray-700">{text}</span> : null
        },
        {
            title: <span className="font-semibold">Hành động</span>,
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        onClick={() => handleEdit(record)} 
                        size="small" 
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600"
                        icon={<span className="mr-1">✎</span>}
                    >
                    </Button>
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
                            icon={<span className="mr-1">✕</span>}
                        >
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            width: '15%',
            align: 'center'
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
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
            <div className="p-5 shadow-lg bg-white rounded-xl flex-[30%] border border-gray-100 overflow-auto">
                <div className="border-b border-blue-500 pb-2 mb-2">
                    <Title className="text-center text-blue-600" level={4}>CÔNG TÁC COI THI</Title>
                </div>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-4 mt-2">
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
                                                    { value: '45', label: '45 phút' },
                                                    { value: '60', label: '60 phút (1 giờ)' },
                                                    { value: '90', label: '90 phút (1.5 giờ)' },
                                                    { value: '120', label: '120 phút (2 giờ)' },
                                                    { value: '180', label: '180 phút (3 giờ)' }
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
                                    {isSubmitting ? "Đang xử lý..." : (editRecord ? "Cập nhật" : "Lưu dữ liệu")}
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

            <div className="p-4 shadow-lg bg-white rounded-xl flex-[75%] text-center border border-gray-100 overflow-y-auto">
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
                                <div>
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
                                        rowKey="id"
                                    />
                                    <div className="flex justify-center mt-5 bg-gray-50 p-2 rounded-lg">
                                        <span className="font-bold text-lg">Tổng số tiết quy chuẩn: <span className="text-red-600 text-lg font-bold">{totalSoTietQuyChuan}</span></span>
                                    </div>
                                </div>
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
