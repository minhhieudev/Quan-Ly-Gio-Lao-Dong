"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Table, Popconfirm, InputNumber, Select, Spin, Pagination, Modal, Divider } from "antd";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Title } = Typography;

const formSchema = {
    maCV: "",
    tenCV: "",
    loaiCV: "",
    soMien: "",
};

const ChucVuForm = () => {
    const [dataList, setDataList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
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

    const [loaiChucVuList, setLoaiChucVuList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newLoaiChucVu, setNewLoaiChucVu] = useState("");

    // Phân trang dữ liệu
    const paginatedData = filteredList.slice(
        (current - 1) * pageSize,
        current * pageSize
    );

    useEffect(() => {
        fetchData();
        fetchLoaiChucVu();
    }, []);

    useEffect(() => {
        let filteredData = dataList;

        // Kiểm tra mã khoa và tên khoa
        if (searchName) {
            filteredData = filteredData.filter(khoa =>
                khoa.tenCV.toLowerCase().includes(searchName.toLowerCase()) ||
                khoa.maCV.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (selectedLoai) {
            filteredData = filteredData.filter(user => user.loaiCV == selectedLoai);
        }

        setFilteredList(filteredData);
    }, [searchName, dataList, selectedLoai]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/chuc-vu`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataList(data);
                setFilteredList(data);
                setLoading(false);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

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

    const onSubmit = async (data) => {
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/chuc-vu", {
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
        setValue("maCV", record.maCV);
        setValue("tenCV", record.tenCV);
        setValue("loaiCV", record.loaiCV);
        setValue("soMien", record.soMien);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/chuc-vu", {
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

    const handleAddLoaiChucVu = async () => {
        try {
            const res = await fetch('/api/admin/loai-chuc-vu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenLoai: newLoaiChucVu })
            });

            if (res.ok) {
                toast.success("Thêm loại chức vụ thành công");
                setNewLoaiChucVu("");
                setIsModalVisible(false);
                fetchLoaiChucVu();
            }
        } catch (error) {
            toast.error("Lỗi khi thêm loại chức vụ");
        }
    };

    const handleDeleteLoaiChucVu = async (id) => {
        try {
            const res = await fetch('/api/admin/loai-chuc-vu', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                toast.success("Xóa loại chức vụ thành công");
                fetchLoaiChucVu();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa loại chức vụ");
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
            title: 'Mã chức vụ',
            dataIndex: 'maCV',
            key: 'maCV',
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'Tên chức vụ',
            dataIndex: 'tenCV',
            key: 'tenCV',
            className: 'text-green-700 font-bold ',

        },
        {
            title: 'Loại chức vụ',
            dataIndex: 'loaiCV',
            key: 'loaiCV',
            className: 'text-blue-700 font-bold ',

        },
        {
            title: 'Miễn',
            dataIndex: 'soMien',
            key: 'soMien',
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
            const res = await fetch("/api/admin/chuc-vu/create", {
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
                <Title className="text-center" level={3}>QUẢN LÝ CHỨC VỤ</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                    <Form.Item
                        label={<span className="font-bold text-xl">Mã chức vụ <span className="text-red-600">*</span></span>}
                        validateStatus={errors.maCV ? 'error' : ''}
                        help={errors.maCV?.message}
                    >
                        <Controller
                            name="maCV"
                            control={control}
                            rules={{ required: "Mã chức vụ là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập mã chức vụ ..." {...field} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Tên chức vụ <span className="text-red-600">*</span></span>}
                        validateStatus={errors.tenCV ? 'error' : ''}
                        help={errors.tenCV?.message}
                    >
                        <Controller
                            name="tenCV"
                            control={control}
                            rules={{ required: "Tên chức vụ là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập tên chức vụ ..." {...field} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Loại chức vụ </span>}
                        className="w-[40%]"
                        help={errors.loaiCV?.message}
                    >
                        <Controller
                            name="loaiCV"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    className="w-full"
                                    placeholder="Chọn loại chức vụ ..."
                                    {...field}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Space style={{ padding: '0 8px 4px' }}>
                                                <Button
                                                    type="text"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => setIsModalVisible(true)}
                                                >
                                                    Thêm
                                                </Button>
                                            </Space>
                                        </>
                                    )}
                                >
                                    {loaiChucVuList.map(loai => (
                                        <Select.Option key={loai._id} value={loai.tenLoai}>
                                            <div className="flex justify-between items-center">
                                                <span>{loai.tenLoai}</span>
                                                <Popconfirm
                                                    title="Bạn có chắc chắn muốn xóa?"
                                                    onConfirm={() => handleDeleteLoaiChucVu(loai._id)}
                                                    okText="Có"
                                                    cancelText="Không"
                                                >
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Số miễn giảm <span className="text-red-600">*</span></span>}
                        validateStatus={errors.soMien ? 'error' : ''}
                        help={errors.soMien?.message}
                    >
                        <Controller
                            name="soMien"
                            control={control}
                            rules={{ required: "Số miễn giảm là bắt buộc" }}
                            render={({ field }) => <InputNumber className="input-text" placeholder="Nhập số miễn giảm ..." {...field} />}
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
                                        {isUploading ? 'Đang tải lên...' : 'Import từ file Excel'}
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

            <div className="p-3 shadow-xl bg-white rounded-xl flex-[75%] ">
                <div className="flex flex-col gap-2 justify-between items-center mb-2">
                    <Title level={3} className="text-center">DANH SÁCH CHỨC VỤ</Title>

                </div>
                <div className="flex gap-3 justify-around w-full mb-1">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm theo mã hoặc tên chức vụ"
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
                    <div className="flex w-[25%] gap-1">
                        <div className="text-base-bold">Loại:</div>
                        <Select size="small"
                            className="flex-1"
                            placeholder="Lọc theo loại"
                            allowClear
                            value={selectedLoai}
                            onChange={value => setSelectedLoai(value)}
                        >
                            {loaiChucVuList.map(loai => (
                                <Option key={loai._id} value={loai.tenLoai}>
                                    {loai.tenLoai}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
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
                    total={filteredList.length}

                    onChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    pageSizeOptions={['10', '25', '50', '100', '200']}
                    showSizeChanger
                    className="flex justify-end"
                />
            </div>

            <Modal
                title="Thêm loại chức vụ mới"
                open={isModalVisible}
                onOk={handleAddLoaiChucVu}
                onCancel={() => {
                    setIsModalVisible(false);
                    setNewLoaiChucVu("");
                }}
            >
                <Input
                    value={newLoaiChucVu}
                    onChange={(e) => setNewLoaiChucVu(e.target.value)}
                    placeholder="Nhập tên loại chức vụ mới"
                />
            </Modal>
        </div>
    );
};

export default ChucVuForm;
