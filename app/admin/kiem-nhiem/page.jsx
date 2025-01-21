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

const { TextArea } = Input;


const { Title } = Typography;

const formSchema = {
    chucVu: "",
    startTime: "",
    user: "",
    endTime: "",
    ghiChu: ''
};

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

    // Phân trang dữ liệu
    const paginatedData = dataList?.slice(
        (current - 1) * pageSize,
        current * pageSize
    );

    useEffect(() => {
        fetchData2();
        fetchData3();
        getListKhoa();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(); // Gọi API sau 1 giây
        }, 1000); // 1000 ms = 1 giây

        return () => {
            clearTimeout(handler); // Hủy bỏ timeout nếu người dùng gõ thêm
        };
    }, [searchName]); // Theo dõi searchName

    useEffect(() => {
        fetchData();
    }, [current, pageSize, selectedKhoa]);


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
            const res = await fetch(`/api/work-hours/select/kiem-nhiem`, {
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
            const res = await fetch(`/api/admin/kiem-nhiem?search=${searchName}&page=${current}&pageSize=${pageSize}&khoa=${selectedKhoa}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await res.json(); // Đảm bảo gọi json() trên đối tượng res
            console.log(data)
            setDataList(data.data); // Cập nhật danh sách dữ liệu
            setTotal(data.totalCount)
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
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/kiem-nhiem", {
                method,
                body: JSON.stringify({ ...data, id: editRecord?._id }),
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
        setValue("chucVu", record.chucVu._id); // Thiết lập ID của chucVu
        setValue("user", record.user._id);

        // Chuyển đổi startTime và endTime thành đối tượng dayjs
        setValue("startTime", dayjs(record.startTime)); // Chuyển đổi thành dayjs
        setValue("endTime", dayjs(record.endTime));     // Chuyển đổi thành dayjs

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
            render: (text) => text.tenCV,
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'Người nhận nhiệm vụ',
            dataIndex: 'user',
            key: 'user',
            render: (text) => text.username,
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
            const method = "POST";
            const res = await fetch("/api/admin/kiem-nhiem/create", {
                method,
                body: JSON.stringify({ data: ListDataUser }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                fetchData();
                toast.success("Thêm mới thành công");
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
            ListData.shift();

            if (ListData.length > 0) {
                createMany(ListData);
            } else {
                toast.error("No user data found in file.");
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
        <div className="flex gap-2 max-sm:flex-col mt-2 h-[92vh]">
            <div className="p-4 shadow-xl bg-white rounded-xl flex-[25%]">
                <Title className="text-center" level={4}>QUẢN LÝ PHÂN CÔNG KIỆM NHIỆM</Title>

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
                                // onChange={(value) => {
                                //     field.onChange(value); // Cập nhật giá trị cho Controller
                                //     const selectedItem = dataListSelect.find(item => item.maCV === value); // Lấy item đầy đủ
                                //     handleSelectChange(selectedItem); // Gọi hàm với item đầy đủ
                                // }}
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
                                // onChange={(value) => {
                                //     field.onChange(value); // Cập nhật giá trị cho Controller
                                //     const selectedItem = dataListSelect.find(item => item.maCV === value); // Lấy item đầy đủ
                                //     handleSelectChange(selectedItem); // Gọi hàm với item đầy đủ
                                // }}
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

            <div className="p-3 shadow-xl bg-white rounded-xl flex-[73%] ">
                <div className="flex flex-col gap-2 justify-between items-center mb-2">
                    <Title level={3} className="text-center">DANH SÁCH PHÂN CÔNG</Title>

                </div>
                <div className="flex gap-3 justify-around w-full mb-1">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm theo tên ..."
                            allowClear
                            className="w-[30%]"
                            size="small"
                            style={{
                                width: 250,
                            }}
                            onChange={(e) => setSearchName(e.target.value)}
                            prefix={<SearchOutlined />}

                        />
                    </div>

                    <div className="flex w-[45%] gap-1">
                        <div className="text-base-bold">Khoa:</div>
                        <Select size="small"
                            className="w-[40%]"
                            placeholder="Lọc theo khoa"
                            allowClear
                            value={selectedKhoa}
                            onChange={value => setSelectedKhoa(value)}
                        >
                            {khoaOptions.map(khoa => (
                                <Option key={khoa} value={khoa}>
                                    {khoa}
                                </Option>
                            ))}
                        </Select>
                    </div>

                </div>
                <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                    <Table
                        dataSource={dataList}
                        columns={columns}
                        rowKey="_id"
                        pagination={false}
                    />
                </div>

                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={total}

                    onChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    pageSizeOptions={['5','10', '25', '50', '100', '200']}
                    showSizeChanger
                    className="flex justify-end"
                />
            </div>


        </div>
    );
};

export default KiemNhiemForm;
