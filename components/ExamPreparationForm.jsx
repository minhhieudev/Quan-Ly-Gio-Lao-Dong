"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Radio, InputNumber, Table, Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Loader from "./Loader";

const { Title } = Typography;

const formSchema = {
    hocPhan: "",
    soTC: 0,
    hocKy: "",
    lopHocPhan: "",
    hinhThucThi: "",
    thoiGianThi: "",
    soTietQuyChuan: 0,
    ghiChu: "",
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const ExamPreparationForm = ({ onUpdateCongTacRaDe,namHoc }) => {
    const [dataList, setDataList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(6);
    const router = useRouter();
    const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const { data: session } = useSession();
    const currentUser = session?.user;

    const { type } = useParams();
    const [loading, setLoading] = useState(true);

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
                const res = await fetch(`/api/work-hours/CongTacRaDe/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDataList(data);
                    setLoading(false)
                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (err) {
                toast.error("An error occurred while fetching data");
            }
        };

        fetchData();
    }, [currentUser]);

    const calculateTotals = () => {
        onUpdateCongTacRaDe(totalSoTietQuyChuan);
    };

    useEffect(() => {
        calculateTotals();
    }, [dataList]);

    const onSubmit = async (data) => {
        if (namHoc == ''){
            toast.error('Vui lòng nhập năm học!')
            return
        }
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/work-hours/CongTacRaDe", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id,namHoc }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();
                if (editRecord && newData) {
                    setDataList(prevData => prevData.map(item => (item._id === newData._id ? newData : item)));
                } else {
                    setDataList(prevData => [...prevData, newData]);
                }
                toast.success("Lưu thành công!");
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

    const handleEdit = (record) => {
        setEditRecord(record);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/work-hours/CongTacRaDe", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setDataList(prevData => prevData.filter(item => item._id !== id));
                toast.success("Record deleted successfully!");
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const columns = [
        {
            title: 'Học phần',
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            className: 'text-blue-500 font-bold'
        },
        {
            title: 'Số TC',
            dataIndex: 'soTC',
            key: 'soTC'
        },
        {
            title: 'Lớp học phần',
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan',
            className: 'text-green-500 font-bold'
        },
        {
            title: 'Học kỳ',
            dataIndex: 'hocKy',
            key: 'hocKy'
        },
        {
            title: 'Hình thức thi',
            dataIndex: 'hinhThucThi',
            key: 'hinhThucThi'
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoiGianThi',
            key: 'thoiGianThi'
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            className: 'text-red-500 font-bold'
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu'
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
            width: 20
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
    };

    // Tính tổng số tiết quy chuẩn
    const totalSoTietQuyChuan = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col h-full">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[15%]">
                <Title className="text-center" level={3}>CÔNG TÁC RA ĐỀ THI</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-8 mt-10">
                    <Space direction="vertical" className="w-full" size={0}>
                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Học phần <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.hocPhan ? 'error' : ''}
                                help={errors.hocPhan?.message}
                            >
                                <Controller
                                    name="hocPhan"
                                    control={control}
                                    rules={{ required: "Học phần là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập học phần ..." {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Số TC <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soTC ? 'error' : ''}
                                help={errors.soTC?.message}
                            >
                                <Controller
                                    name="soTC"
                                    control={control}
                                    rules={{ required: "Số TC là bắt buộc", min: { value: 1, message: "Số TC phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber {...field} className="input-number" min={1} />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Lớp học phần <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.lopHocPhan ? 'error' : ''}
                                help={errors.lopHocPhan?.message}
                            >
                                <Controller
                                    name="lopHocPhan"
                                    control={control}
                                    rules={{ required: "Lớp học phần là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập lớp học phần ..." {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Học kỳ <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.hocKy ? 'error' : ''}
                                help={errors.hocKy?.message}
                            >
                                <Controller
                                    name="hocKy"
                                    control={control}
                                    rules={{ required: "Học kỳ là bắt buộc" }}
                                    render={({ field }) => (
                                        <Radio.Group {...field} className="font-semibold">
                                            <Radio value="1">Kỳ 1</Radio>
                                            <Radio value="2">Kỳ 2</Radio>
                                        </Radio.Group>
                                    )}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex justify-between">
                            <Form.Item
                                label={<span className="font-bold text-xl">Hình thức thi <span className="text-red-600">*</span></span>}
                                validateStatus={errors.hinhThucThi ? 'error' : ''}
                                help={errors.hinhThucThi?.message}
                            >
                                <Controller
                                    name="hinhThucThi"
                                    control={control}
                                    rules={{ required: "Hình thức thi là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập hình thức thi ..." {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Thời gian thi (Phút) <span className="text-red-600">*</span></span>}
                                validateStatus={errors.thoiGianThi ? 'error' : ''}
                                help={errors.thoiGianThi?.message}
                            >
                                <Controller
                                    name="thoiGianThi"
                                    control={control}
                                    rules={{ required: "Thời gian thi là bắt buộc" }}
                                    render={({ field }) => <InputNumber className="input-text" placeholder="Nhập thời gian thi ..." {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soTietQuyChuan ? 'error' : ''}
                                help={errors.soTietQuyChuan?.message}
                            >
                                <Controller
                                    name="soTietQuyChuan"
                                    control={control}
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber {...field} className="input-number text-red-700 font-bold" min={1} />}
                                />
                            </Form.Item>

                            <Form.Item label={<span className="font-bold text-xl">Ghi chú</span>}>
                                <Controller
                                    name="ghiChu"
                                    control={control}
                                    render={({ field }) => <Input className="input-text" {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                                <Button type="default" danger onClick={onReset} disabled={isSubmitting}>
                                    Reset
                                </Button>
                            </Space>
                        </Form.Item>
                    </Space>
                </Form>
            </div>

            <div className="px-4  py-2 shadow-xl bg-white rounded-xl flex-[60%]">
                <Title className="text-center" level={3}>DANH SÁCH</Title>

                <Table
                    columns={columns}
                    dataSource={dataList}
                    rowKey="id"
                    pagination={{ current, pageSize, total: dataList.length }}
                    onChange={handleTableChange}
                />

                <div className="text-center font-bold text-xl mt-4">
                    <span>Tổng số tiết quy chuẩn: </span>
                    <span className="text-red-600">{totalSoTietQuyChuan}</span>
                </div>
            </div>
        </div>
    );
};

export default ExamPreparationForm;
