"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Table, Popconfirm, InputNumber } from "antd";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { SearchOutlined } from '@ant-design/icons'

const { Title } = Typography;

const formSchema = {
    maNgach: "",
    tenNgach: "",
    GCGD: "",
    GCNCKH: "",
    GCPVCD: "",
};

const MaNgachForm = () => {
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
                khoa.tenNgach.toLowerCase().includes(searchName.toLowerCase()) ||
                khoa.maNgach.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredList(filteredData);
    }, [searchName, dataList]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/ma-ngach`, {
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
            const res = await fetch("/api/admin/ma-ngach", {
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
        setValue("maNgach", record.maNgach);
        setValue("tenNgach", record.tenNgach);
        setValue("GCGD", record.GCGD);
        setValue("GCNCKH", record.GCNCKH);
        setValue("GCPVCD", record.GCPVCD);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/ma-ngach", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Đã xóa ngạch !");
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
            title: 'Mã ngạch',
            dataIndex: 'maNgach',
            key: 'maNgach',
            className: 'text-green-700 font-bold ',

        },
        {
            title: 'Tên ngạch',
            dataIndex: 'tenNgach',
            key: 'tenNgach',
            className: 'text-blue-700 font-bold',

        },
        {
            title: 'GC Giảng dạy',
            dataIndex: 'GCGD',
            key: 'GCGD',
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'GC NCKH',
            dataIndex: 'GCNCKH',
            key: 'GCNCKH',
            className: 'text-red-700 font-bold ',

        },
        {
            title: 'GC PVCD',
            dataIndex: 'GCPVCD',
            key: 'GCPVCD',
            className: 'text-red-700 font-bold ',

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

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col mt-2 h-[83vh]">
            <div className="p-4 shadow-xl bg-white rounded-xl flex-[30%]">
                <Title className="text-center" level={3}>QUẢN LÝ MÃ NGẠCH</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                    <Form.Item
                        label={<span className="font-bold text-xl">Mã ngạch <span className="text-red-600">*</span></span>}
                        validateStatus={errors.maNgach ? 'error' : ''}
                        help={errors.maNgach?.message}
                    >
                        <Controller
                            name="maNgach"
                            control={control}
                            rules={{ required: "Mã ngạch là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập mã ngạch ..." {...field} />}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Tên ngạch <span className="text-red-600">*</span></span>}
                        validateStatus={errors.tenNgach ? 'error' : ''}
                        help={errors.tenNgach?.message}
                    >
                        <Controller
                            name="tenNgach"
                            control={control}
                            rules={{ required: "Tên ngạch là bắt buộc" }}
                            render={({ field }) => <Input className="input-text" placeholder="Nhập tên ngạch ..." {...field} />}
                        />
                    </Form.Item>

                    <div className="flex gap-1 justify-center">
                        <Form.Item
                            label={<span className="font-bold text-xl">Giờ chuẩn GD <span className="text-red-600">*</span></span>}
                            validateStatus={errors.GCGD ? 'error' : ''}
                            help={errors.GCGD?.message}
                        >
                            <Controller
                                name="GCGD"
                                control={control}
                                rules={{ required: "Giờ chuẩn GD là bắt buộc" }}
                                render={({ field }) => <InputNumber className="input-text" placeholder="Nhập giờ chuẩn GD ..." {...field} />}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Giờ chuẩn NCKH <span className="text-red-600">*</span></span>}
                            validateStatus={errors.GCNCKH ? 'error' : ''}
                            help={errors.GCNCKH?.message}
                        >
                            <Controller
                                name="GCNCKH"
                                control={control}
                                rules={{ required: "Giờ chuẩn NCKH là bắt buộc" }}
                                render={({ field }) => <InputNumber className="input-text" placeholder="Nhập giờ chuẩn NCKH ..." {...field} />}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Giờ chuẩn PVCD <span className="text-red-600">*</span></span>}
                            validateStatus={errors.GCPVCD ? 'error' : ''}
                            help={errors.GCPVCD?.message}
                        >
                            <Controller
                                name="GCPVCD"
                                control={control}
                                rules={{ required: "Giờ chuẩn PVCD là bắt buộc" }}
                                render={({ field }) => <InputNumber className="input-text" placeholder="Nhập giờ chuẩn PVCD ..." {...field} />}
                            />
                        </Form.Item>
                    </div>

                    <div className="text-center mt-6">
                        <Space size="small" >
                            <Button size="small" className="bg-blue-500 hover:bg-blue-700" loading={isSubmitting} type="primary" htmlType="submit">
                                {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                            </Button>
                            <Button danger size="small" className="ml-4" htmlType="button" onClick={onReset}>
                                Reset
                            </Button>
                        </Space>
                    </div>
                </Form>
            </div>

            <div className="p-3 shadow-xl bg-white rounded-xl flex-[70%]">
                <div className="flex flex-col gap-2 justify-between items-center mb-4">
                    <Title level={3} className="text-center">DANH SÁCH NGẠCH</Title>
                    <Input
                        placeholder="Tìm kiếm theo mã hoặc tên ngạch"
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

export default MaNgachForm;
