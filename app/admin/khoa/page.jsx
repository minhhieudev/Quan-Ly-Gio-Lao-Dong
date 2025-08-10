"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Table, Popconfirm } from "antd";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography;

const formSchema = {
    maKhoa: "",
    tenKhoa: "",
};

const KhoaForm = () => {
    const [dataList, setDataList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(5);
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filteredData = dataList;

        // Kiểm tra mã khoa và tên khoa
        if (searchName) {
            filteredData = filteredData.filter(khoa =>
                khoa.tenKhoa.toLowerCase().includes(searchName.toLowerCase()) ||
                khoa.maKhoa.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredList(filteredData);
    }, [searchName, dataList]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/khoa`, {
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

    const onSearch = (value) => {
        setSearchName(value);
    };

    const onSubmit = async (data) => {
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/khoa", {
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
        setValue("maKhoa", record.maKhoa);
        setValue("tenKhoa", record.tenKhoa);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/khoa", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Đã xóa khoa !");
                setDataList(prevData => prevData.filter(item => item._id !== id));
            } else {
                toast.error("Failed to delete record");
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
            title: 'Mã khoa',
            dataIndex: 'maKhoa',
            key: 'maKhoa',
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'Tên khoa',
            dataIndex: 'tenKhoa',
            key: 'tenKhoa',
            className: 'text-green-700 font-bold ',

        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        size="small"
                        onClick={() => handleEdit(record)}
                        type="primary"
                        icon={<EditOutlined />}
                        title="Sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            danger
                            size="small"
                            type="primary"
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 140
        },
    ];

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col mt-4 h-[83vh]">
            <div className="p-4 shadow-xl bg-white rounded-xl flex-[25%]">
                <Title className="text-center" level={3}>QUẢN LÝ KHOA</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                    <Form.Item
                        label={<span className="font-bold text-xl">Mã khoa <span className="text-red-600">*</span></span>}
                        validateStatus={errors.maKhoa ? 'error' : ''}
                        help={errors.maKhoa?.message}
                    >
                        <Controller
                            name="maKhoa"
                            control={control}
                            rules={{ required: "Mã khoa là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập mã khoa ..." {...field} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Tên khoa <span className="text-red-600">*</span></span>}
                        validateStatus={errors.tenKhoa ? 'error' : ''}
                        help={errors.tenKhoa?.message}
                    >
                        <Controller
                            name="tenKhoa"
                            control={control}
                            rules={{ required: "Tên khoa là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập tên khoa ..." {...field} />}
                        />
                    </Form.Item>

                    <Space size="middle">
                        <Button className="bg-blue-500 hover:bg-blue-700" loading={isSubmitting} type="primary" htmlType="submit">
                            {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                        </Button>
                        <Button danger className="ml-4" htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                    </Space>
                </Form>
            </div>

            <div className="p-3 shadow-xl bg-white rounded-xl flex-[75%]">
                <div className="flex flex-col gap-2 justify-between items-center mb-4">
                    <Title level={3} className="text-center">DANH SÁCH KHOA</Title>
                    <Input
                        placeholder="Tìm kiếm theo mã hoặc tên khoa"
                        allowClear
                        size="small"
                        style={{
                            width: 250,
                        }}
                        onChange={(e) => setSearchName(e.target.value)} 
                        prefix={<SearchOutlined />}

                    />
                </div>

                <Table
                    dataSource={filteredList}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        current,
                        pageSize,
                        total: filteredList.length,
                        onChange: (page) => setCurrent(page),
                    }}
                />
            </div>
        </div>
    );
};

export default KhoaForm;
