"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Table, Popconfirm, InputNumber, Pagination } from "antd";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography;

const formSchema = {
    tenCV: "",
    moTa: "",
    soGio: 0,
};

const HuongDanForm = () => {
    const [dataList, setDataList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(true);

    const [pageSize, setPageSize] = useState(10);
    const [current, setCurrent] = useState(1);

    // Phân trang dữ liệu
    const paginatedData = filteredList.slice(
        (current - 1) * pageSize,
        current * pageSize
    );

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filteredData = dataList;

        if (searchName) {
            filteredData = filteredData.filter(khoa =>
                khoa.tenCV.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredList(filteredData);
    }, [searchName, dataList]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/huong-dan`, {
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

    const onSubmit = async (data) => {
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/huong-dan", {
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
        setValue("tenCV", record.tenCV);
        setValue("moTa", record?.moTa);
        setValue("soGio", record.soGio);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/huong-dan", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Đã xóa !");
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
            title: 'Tên công việc',
            dataIndex: 'tenCV',
            key: 'tenCV',
            className: 'text-green-700 font-bold ',

        },
        {
            title: 'Mô tả',
            dataIndex: 'moTa',
            key: 'moTa',
            className: 'text-red-700 font-bold ',
            width: 600

        },
        {
            title: 'Số giờ QC',
            dataIndex: 'soGio',
            key: 'soGio',
            className: 'text-black font-bold',

        },

        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        size="small"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ color: '#1890ff' }}
                        title="Sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button 
                            size="small"
                            type="link"
                            icon={<DeleteOutlined />}
                            style={{ color: '#ff4d4f' }}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 100
        },
    ];


    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col mt-2 h-[92vh]">
            <div className="p-4 shadow-xl bg-white rounded-xl flex-[25%]">
                <Title className="text-center" level={4}>QUẢN LÝ LOẠI HÌNH HƯỚNG DẪN</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                    <Form.Item
                        label={<span className="font-bold text-xl">Tên công việc <span className="text-red-600">*</span></span>}
                        validateStatus={errors.tenCV ? 'error' : ''}
                        help={errors.tenCV?.message}
                    >
                        <Controller
                            name="tenCV"
                            control={control}
                            rules={{ required: "Tên công việc là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập tên công việc ..." {...field} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Mô tả <span className="text-red-600">*</span></span>}
                        validateStatus={errors.moTa ? 'error' : ''}
                        help={errors.moTa?.message}
                    >
                        <Controller
                            name="moTa"
                            control={control}
                            rules={{ required: "Mô tả là bắt buộc" }}
                            render={({ field }) => (
                                <Input.TextArea
                                    className="input-text"
                                    placeholder="Nhập mô tả công việc ..."
                                    rows={4} // Điều chỉnh số hàng của TextArea
                                    {...field}
                                />
                            )}
                        />
                    </Form.Item>


                    <Form.Item
                        label={<span className="font-bold text-xl">Số giờ <span className="text-red-600">*</span></span>}
                        validateStatus={errors.soGio ? 'error' : ''}
                        help={errors.soGio?.message}
                    >
                        <Controller
                            name="soGio"
                            control={control}
                            rules={{ required: "Số giờ quy chuẩn là bắt buộc" }}
                            render={({ field }) => <InputNumber className="input-text" placeholder="Nhập số giờ quy chuẩn ..." {...field} />}
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

            <div className="p-3 shadow-xl bg-white rounded-xl flex-[75%] ">
                <div className="flex flex-col gap-2 justify-between items-center mb-2">
                    <Title level={3} className="text-center">DANH SÁCH CÔNG VIỆC</Title>

                </div>
                <div className="flex gap-3 justify-around w-full mb-1">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm theo tên "
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


        </div>
    );
};

export default HuongDanForm;
