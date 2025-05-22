"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Table, Popconfirm, InputNumber, Select, Spin, Pagination } from "antd";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { SearchOutlined } from '@ant-design/icons'
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { FileExcelOutlined } from '@ant-design/icons';
import { exportPCKiemNhiem } from "@lib/fileExport";

const { TextArea } = Input;


const { Title } = Typography;

const formSchema = {
    chucVu: "",
    startTime: "",
    user: "",
    endTime: "",
    ghiChu: ''
};

const SCHOOL_YEAR_START_KEY = "schoolYearStart";
const SCHOOL_YEAR_END_KEY = "schoolYearEnd";

const KiemNhiemForm = () => {
    const [dataList, setDataList] = useState([]);
    const [listChucVu, setListChucVu] = useState([]);
    const [listUser, setListUser] = useState([]);
    const [total, setTotal] = useState(0);
    const [editRecord, setEditRecord] = useState(null);
    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedLoai, setSelectedLoai] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [pageSize, setPageSize] = useState(10);
    const [current, setCurrent] = useState(1);
    const [khoaOptions, setKhoaOptions] = useState([]);
    const [selectedKhoa, setSelectedKhoa] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loaiChucVuList, setLoaiChucVuList] = useState([]);

    // Thêm state cho ngày bắt đầu/kết thúc năm học
    const [schoolYearStart, setSchoolYearStart] = useState(null);
    const [schoolYearEnd, setSchoolYearEnd] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const valStart = localStorage.getItem(SCHOOL_YEAR_START_KEY);
            setSchoolYearStart(valStart ? dayjs(valStart) : null);

            const valEnd = localStorage.getItem(SCHOOL_YEAR_END_KEY);
            setSchoolYearEnd(valEnd ? dayjs(valEnd) : null);
        }
    }, []);

    // Khi thay đổi, lưu vào localStorage
    const handleSchoolYearStartChange = (date) => {
        setSchoolYearStart(date);
        if (date) localStorage.setItem(SCHOOL_YEAR_START_KEY, date.toISOString());
        else localStorage.removeItem(SCHOOL_YEAR_START_KEY);
    };
    const handleSchoolYearEndChange = (date) => {
        setSchoolYearEnd(date);
        if (date) localStorage.setItem(SCHOOL_YEAR_END_KEY, date.toISOString());
        else localStorage.removeItem(SCHOOL_YEAR_END_KEY);
    };

    // Thêm hàm xử lý filter data
    const getFilteredData = () => {
        return dataList.filter(item => {
            const matchName = item.user?.username?.toLowerCase().includes(searchName.toLowerCase());
            const matchKhoa = !selectedKhoa || item.user?.khoa === selectedKhoa;
            const matchChucVu = !selectedLoai || item.chucVu?.loaiCV === selectedLoai;

            return matchName && matchKhoa && matchChucVu;
        });
    };

    // Cập nhật cách tính paginatedData
    const filteredData = getFilteredData();
    const paginatedData = filteredData.slice(
        (current - 1) * pageSize,
        current * pageSize
    );

    useEffect(() => {
        fetchData2();
        fetchData3();
        getListKhoa();
        fetchLoaiChucVu();
    }, []);


    useEffect(() => {
        fetchData();
    }, []);
    const fetchLoaiChucVu = async () => {
        try {
            const res = await fetch('/api/admin/loai-chuc-vu');
            if (res.ok) {
                const data = await res.json();
                setLoaiChucVuList(data);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách loại chức vụ");
        }
    };

    const fetchData3 = async () => {
        try {
            const res = await fetch(`/api/admin/user`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListUser(data);
                setLoading(false)
            } else {
                toast.error("Failed to fetch data user");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const fetchData2 = async () => {
        try {
            const res = await fetch(`/api/admin/select/kiem-nhiem`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListChucVu(data);
            } else {
                toast.error("Failed to fetch data chucVu");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/kiem-nhiem`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await res.json(); // Đảm bảo gọi json() trên đối tượng res
            setDataList(data); // Cập nhật danh sách dữ liệu
            setLoading(false); // Đặt loading thành false
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("An error occurred while fetching data");
        }
    };

    const getListKhoa = async () => {
        try {
            const res = await fetch(`/api/admin/khoa`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();

                // Chỉ lấy thuộc tính 'tenKhoa' từ dữ liệu
                const tenKhoaList = data.map(khoa => khoa.tenKhoa);

                setKhoaOptions(tenKhoaList);
            } else {
                toast.error("Failed to get khoa");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data khoa");
        }
    };

    const onSubmit = async (data) => {
        try {
            // Thêm ngày bắt đầu/kết thúc năm học vào data
            const payload = {
                ...data,
                id: editRecord?._id,
                schoolYearStart,
                schoolYearEnd,
            };
            console.log(payload);
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/kiem-nhiem", {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success(editRecord ? "Chỉnh sửa thành công" : "Thêm mới thành công");
                fetchData();
                onReset();
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
    const handleEdit = (record) => {
        setEditRecord(record);
        setShowForm(true);
        setValue("chucVu", record?.chucVu?._id);
        setValue("user", record?.user?._id);
        setValue("startTime", dayjs(record.startTime));
        setValue("endTime", dayjs(record.endTime));
        setValue("ghiChu", record.ghiChu);
    };
    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/kiem-nhiem", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Đã xóa chức vụ !");
                setDataList(prevData => prevData.filter(item => item._id !== id));
            } else {
                toast.error("Xóa thất bại");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Chức vụ / Công việc',
            dataIndex: 'chucVu',
            key: 'chucVu',
            render: (text) => text?.tenCV,
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'Người nhận nhiệm vụ',
            dataIndex: 'user',
            key: 'user',
            render: (text) => text?.username,
            className: 'text-blue-700 font-bold ',

        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
            className: 'text-green-700 font-bold ',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
            className: 'text-blue-700 font-bold ',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            className: 'text-black font-bold',

        },
        // {
        //     title: 'Ngày bắt đầu năm học',
        //     dataIndex: 'schoolYearStart',
        //     key: 'schoolYearStart',
        //     render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : "",
        //     className: 'text-black font-bold',

        // },
        // {
        //     title: 'Ngày kết thúc năm học',
        //     dataIndex: 'schoolYearEnd',
        //     key: 'schoolYearEnd',
        //     render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : "",
        //     className: 'text-black font-bold',

        // },
        // {
        //     title: 'Ghi chú',
        //     dataIndex: 'chucVu',
        //     key: 'chucVu',
        //     className: 'text-black font-bold',
        //     render: (text) => text?.loaiCV,
        // },

        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button size="small" onClick={() => handleEdit(record)} type="primary">Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button size="small" type="primary" danger>Xoá</Button>
                    </Popconfirm>
                </Space>
            ),
            width: 140
        },
    ];

    const createMany = async (ListDataUser) => {
        setIsUploading(true);
        try {
            const res = await fetch("/api/admin/kiem-nhiem/create", {
                method: "POST",
                body: JSON.stringify({ data: ListDataUser }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const result = await res.json();
                fetchData();
                toast.success("Thêm mới thành công");

                if (result.errors && result.errors.length > 0) {
                    // Hiển thị lỗi chi tiết
                    toast.error(`Có ${result.errors.length} bản ghi bị bỏ qua!`);
                    // Có thể show chi tiết hơn bằng modal hoặc bảng
                    console.log("Lỗi import:", result.errors);
                }

                onReset();
                fileInputRef.current.value = "";
            } else {
                toast.error("Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        } finally {
            setIsUploading(false);
        }
    };


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const ListData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Tìm dòng header (chứa "STT")
            const headerIndex = ListData.findIndex(
                row => Array.isArray(row) && row[0] && row[0].toString().toLowerCase().includes("stt")
            );

            // Nếu tìm thấy header, lấy các dòng sau header và có dữ liệu thực sự
            let dataRows = [];
            if (headerIndex !== -1) {
                dataRows = ListData.slice(headerIndex + 1).filter(
                    row => Array.isArray(row) && row[0] && !isNaN(Number(row[0]))
                );
            }
            console.log('dataRows:',dataRows);

            const parseDate = (dateStr) => {
                if (!dateStr) return null;

                // Nếu là số (Excel date serial)
                if (typeof dateStr === "number") {
                    // Excel date serial: ngày 1/1/1900 là 1
                    // dayjs không hỗ trợ trực tiếp, nên dùng new Date hoặc dayjs
                    // Lưu ý: Excel có bug năm nhuận 1900, nhưng thường không ảnh hưởng thực tế
                    return dayjs(new Date(Math.round((dateStr - 25569) * 86400 * 1000)));
                }

                // Nếu là object Date
                if (dateStr instanceof Date) {
                    return dayjs(dateStr);
                }

                // Nếu là object dayjs
                if (dayjs.isDayjs(dateStr)) {
                    return dateStr;
                }

                // Nếu là chuỗi, thử nhiều định dạng
                const formats = [
                    "DD/MM/YYYY",
                    "D/M/YYYY",
                    "DD-MM-YYYY",
                    "D-M-YYYY",
                    "YYYY/MM/DD",
                    "YYYY/M/D",
                    "YYYY-MM-DD",
                    "YYYY-M-D",
                    "MM/DD/YYYY",
                    "M/D/YYYY",
                    "MM-DD-YYYY",
                    "M-D-YYYY"
                ];

                for (let fmt of formats) {
                    let d = dayjs(dateStr, fmt, true);
                    if (d.isValid()) return d;
                }

                // Fallback: để dayjs tự đoán
                let d = dayjs(dateStr);
                return d.isValid() ? d : null;
            };
            
            const dataWithSchoolYear = dataRows.map(row => ({
                stt: row[0],
                user: row[1],
                chucVu: row[3],
                startTime: parseDate(row[5]),
                endTime: parseDate(row[6]),
                ghiChu: row[7],
                schoolYearStart: schoolYearStart || null,
                schoolYearEnd: schoolYearEnd || null
            }));

            console.log("Dữ liệu thực sự:", dataWithSchoolYear);

            if (dataRows.length > 0) {
                createMany(dataWithSchoolYear);
            } else {
                toast.error("Không tìm thấy dữ liệu hợp lệ trong file.");
            }
        };

        reader.onerror = () => {
            toast.error("Đã xảy ra lỗi khi đọc file Excel");
        };

        reader.readAsBinaryString(file);
    };


    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col mt-2 h-[90vh]">
            {showForm && (
                <div className="p-4 shadow-xl bg-white rounded-xl basis-1/3">
                    <div className="flex justify-between items-center">
                        <Title className="text-center" level={4}>QUẢN LÝ PHÂN CÔNG KIỆM NHIỆM</Title>
                        <Button
                            type="text"
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-red-500"
                        >
                            ✕
                        </Button>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div>
                            <div className="font-bold">Ngày bắt đầu năm học</div>
                            <DatePicker
                                value={schoolYearStart}
                                onChange={handleSchoolYearStartChange}
                                placeholder="Chọn ngày bắt đầu năm học"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <div className="font-bold">Ngày kết thúc năm học</div>
                            <DatePicker
                                value={schoolYearEnd}
                                onChange={handleSchoolYearEndChange}
                                placeholder="Chọn ngày kết thúc năm học"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                    <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                        <Form.Item
                            label={<span className="font-bold text-xl">Công việc / Chức vụ <span className="text-red-600">*</span></span>}
                            validateStatus={errors.chucVu ? 'error' : ''}
                            help={errors.chucVu?.message}
                        >
                            <Controller
                                name="chucVu"
                                control={control}
                                rules={{ required: "Chức vụ, công việc là bắt buộc" }}
                                render={({ field }) => (
                                    <Select
                                        className="input-select"
                                        placeholder="Chọn công việc, chức vụ ..."
                                        {...field}
                                        options={listChucVu.map(item => ({ label: item.tenCV, value: item._id }))}
                                    />
                                )}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Người nhận nhiệm vụ <span className="text-red-600">*</span></span>}
                            validateStatus={errors.user ? 'error' : ''}
                            help={errors.user?.message}
                        >
                            <Controller
                                name="user"
                                control={control}
                                rules={{ required: "Bắt buộc" }}

                                render={({ field }) => (
                                    <Select
                                        className="input-select"
                                        placeholder="Chọn người nhận nhiệm vụ ..."
                                        {...field}
                                        options={listUser.map(item => ({ label: item.username, value: item._id }))}
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.label.toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                )}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Ngày bắt đầu </span>}
                            className="w-[40%]"
                            help={errors.startTime?.message}
                        >
                            <Controller
                                name="startTime"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker {...field} placeholder="Chọn ngày bắt đầu" />
                                )}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<span className="font-bold text-xl">Ngày kết thúc </span>}
                            className="w-[40%]"
                            help={errors.endTime?.message}
                        >
                            <Controller
                                name="endTime"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker {...field} placeholder="Chọn ngày bắt đầu" />
                                )}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Ghi chú <span className="text-red-600">*</span></span>}
                            validateStatus={errors.ghiChu ? 'error' : ''}
                            help={errors.ghiChu?.message}
                        >
                            <Controller
                                name="ghiChu"
                                control={control}
                                render={({ field }) => <TextArea className="input-text" placeholder="Nhập ghi chú..." {...field} />}
                            />
                        </Form.Item>


                        <Space size="middle">
                            <Button className="bg-blue-500 hover:bg-blue-700" loading={isSubmitting} type="primary" htmlType="submit">
                                {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                            </Button>
                            <div className="text-center">
                                <Spin spinning={isUploading}>
                                    <label htmlFor="excelUpload">
                                        <Button
                                            className=" button-lien-thong-vlvh"
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Đang tải lên...' : 'Import từ Excel'}
                                        </Button>
                                    </label>
                                </Spin>

                                <div className="hidden">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="excelUpload"
                                        ref={fileInputRef}
                                    />
                                </div>
                            </div>
                            <Button danger className="ml-4" htmlType="button" onClick={onReset}>
                                Reset
                            </Button>
                        </Space>
                    </Form>
                </div>
            )}

            <div className={`p-3 shadow-xl bg-white rounded-xl ${showForm ? 'basis-2/3' : 'w-full'}`}>
                <div className="flex flex-col gap-2 justify-between items-center mb-2">
                    <div className="flex justify-between w-full items-center">
                        <div className="flex-1 text-center">
                            <Title level={4}>DANH SÁCH PHÂN CÔNG</Title>
                        </div>
                        {!showForm && (
                            <Button
                                type="primary"
                                onClick={() => setShowForm(true)}
                                className="bg-blue-500"
                            >
                                Thêm mới
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-around w-full mb-1 text-small-bold">
                    <div className="">
                        <Input
                            placeholder="Tìm kiếm theo tên ..."
                            allowClear
                            className=""
                            size="small"
                            style={{
                                width: 250,
                            }}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                setCurrent(1); // Reset về trang 1 khi tìm kiếm
                            }}
                            prefix={<SearchOutlined />}
                        />
                    </div>

                    <div className="flex gap-1">
                        <div className="text-base-bold">Khoa:</div>
                        <Select
                            size="small"
                            style={{ width: 200 }}
                            placeholder="Lọc theo khoa"
                            allowClear
                            value={selectedKhoa}
                            onChange={value => {
                                setSelectedKhoa(value);
                                setCurrent(1);
                            }}
                        >
                            {khoaOptions.map(khoa => (
                                <Option key={khoa} value={khoa}>
                                    {khoa}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex gap-1">
                        <div className="text-base-bold ml-2">Chức vụ:</div>
                        <Select
                            size="small"
                            style={{ width: 200 }}
                            placeholder="Lọc theo chức vụ"
                            allowClear
                            value={selectedLoai}
                            onChange={value => {
                                setSelectedLoai(value);
                                setCurrent(1);
                            }}
                        >
                            {loaiChucVuList.map(loai => (
                                <Option key={loai._id} value={loai.tenLoai}>
                                    {loai.tenLoai}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                    <Table
                        dataSource={paginatedData}
                        columns={columns}
                        rowKey="_id"
                        pagination={false}
                    />
                </div>

                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={filteredData.length}
                    onChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    pageSizeOptions={['10', '25', '50', '100', '200']}
                    showSizeChanger
                    className="flex justify-end"
                />

                <Button className="button-lien-thong-vlvh text-white font-bold shadow-md " onClick={() => exportPCKiemNhiem(paginatedData)}>
                    <FileExcelOutlined /> Xuất Excel
                </Button>

            </div>


        </div >
    );
};

export default KiemNhiemForm;
