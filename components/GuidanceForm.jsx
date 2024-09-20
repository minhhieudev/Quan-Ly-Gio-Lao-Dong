"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Table, Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Loader from "./Loader";

const { Title } = Typography;

const formSchema = {
    noiDungCongViec: "",
    soSVSoNhom: 0,
    lopHocPhan: "",
    thoiGian: "",
    soBuoi: 0,
    soTietQuyChuan: 0,
    tongCong: 0,
    ghiChu: "",
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const GuidanceForm = ({ onUpdateCongTacHuongDan,namHoc }) => {
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

    const [loading, setLoading] = useState(true);

    const { type } = useParams();

    useEffect(() => {
        if (editRecord) {
            reset(editRecord);
        } else {
            reset(formSchema);
        }
    }, [editRecord, reset]);

    useEffect(() => {
        setValue("tongCong", watch("soTietQuyChuan"));
    }, [watch("soTietQuyChuan"), setValue]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/work-hours/CongTacHuongDan/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}`, {
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
        onUpdateCongTacHuongDan(totalSoTietQuyChuan);
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
            const res = await fetch("/api/work-hours/CongTacHuongDan", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id ,namHoc}),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();
                if (editRecord && newData) {
                    setDataList(prevData => prevData.map(item => (item._id === newData._id ? newData : item)));
                } else {
                    setDataList(prevData => [...prevData, newData]);
                }
                toast.success("Record saved successfully!");
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
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/work-hours/CongTacHuongDan", {
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
            title: 'Nội dung công việc',
            dataIndex: 'noiDungCongViec',
            key: 'noiDungCongViec',
            className: 'text-blue-500 font-bold'
        },
        {
            title: 'Số SV/Số nhóm',
            dataIndex: 'soSVSoNhom',
            key: 'soSVSoNhom'
        },
        {
            title: 'Lớp học phần',
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan',
            className: 'text-green-500 font-bold'
        },
        {
            title: 'Thời gian',
            dataIndex: 'thoiGian',
            key: 'thoiGian'
        },
        {
            title: 'Số buổi',
            dataIndex: 'soBuoi',
            key: 'soBuoi'
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            className: 'text-red-500 font-bold'
        },
        // {
        //     title: 'Tổng cộng',
        //     dataIndex: 'tongCong',
        //     key: 'tongCong',
        //     className: 'text-red-500 font-bold'
        // },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleEdit(record)} type="primary">Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" danger>Xoá</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
    };

    const totalSoTietQuyChuan = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);

    return loading ? (
        <Loader />
      ) : (
        <div className="flex gap-5 max-sm:flex-col">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[40%]">
                <Title className="text-center" level={3}>CÔNG TÁC HƯỚNG DẪN</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-8 mt-10">
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Nội dung công việc <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.noiDungCongViec ? 'error' : ''}
                                help={errors.noiDungCongViec?.message}
                            >
                                <Controller
                                    name="noiDungCongViec"
                                    control={control}
                                    rules={{ required: "Nội dung công việc là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập nội dung công việc ..." {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Số SV/Số nhóm <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soSVSoNhom ? 'error' : ''}
                                help={errors.soSVSoNhom?.message}
                            >
                                <Controller
                                    name="soSVSoNhom"
                                    control={control}
                                    rules={{ required: "Số SV/Số nhóm là bắt buộc" }}
                                    render={({ field }) => <InputNumber className="input-number" min={1} {...field} />}
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
                                label={<span className="font-bold text-xl">Thời gian <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.thoiGian ? 'error' : ''}
                                help={errors.thoiGian?.message}
                            >
                                <Controller
                                    name="thoiGian"
                                    control={control}
                                    rules={{ required: "Thời gian là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập thời gian ..." {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Số buổi <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soBuoi ? 'error' : ''}
                                help={errors.soBuoi?.message}
                            >
                                <Controller
                                    name="soBuoi"
                                    control={control}
                                    rules={{ required: "Số buổi là bắt buộc", min: { value: 1, message: "Số buổi phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber className="input-number" min={1} {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soTietQuyChuan ? 'error' : ''}
                                help={errors.soTietQuyChuan?.message}
                            >
                                <Controller
                                    name="soTietQuyChuan"
                                    control={control}
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber className="input-number text-red-700 font-bold" min={1} {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span className="font-bold text-xl">Ghi chú</span>}
                        >
                            <Controller
                                name="ghiChu"
                                control={control}
                                render={({ field }) => <Input className="input-text" {...field} />}
                            />
                        </Form.Item>

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

            <div className="p-5 shadow-xl bg-white rounded-xl flex-[60%]">
                <Title className="text-center" level={3}>Danh sách công việc</Title>

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

export default GuidanceForm;
