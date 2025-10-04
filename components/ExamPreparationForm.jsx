"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Table, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
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


const ExamPreparationForm = ({ onUpdateCongTacRaDe, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(6);
    const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const { data: session } = useSession();
    const currentUser = session?.user;

    const { type } = useParams();
    const [loading, setLoading] = useState(true);

    const [listOptions, setListOptions] = useState([]);

    const hinhThuc = watch("hinhThucThi");

    useEffect(() => {
        if (hinhThuc) {
            let gioChuan

            if (hinhThuc == 'TL' || hinhThuc == 'TL+TN(1)') {
                gioChuan = 2
            }
            if (hinhThuc == 'TN' || hinhThuc == 'TL+TN(2)') {
                gioChuan = 4
            }
            if (hinhThuc == 'VĐ') {
                gioChuan = 4
            }
            if (hinhThuc == 'TH') {
                gioChuan = 2
            }

            setValue("soTietQuyChuan", gioChuan);
        }

    }, [hinhThuc]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/hinh-thuc-thi`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListOptions(data);
                setLoading(false);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
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
                const res = await fetch(`/api/work-hours/CongTacRaDe/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}&ky=${ky}`, {
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
    }, [namHoc, ky]);

    const calculateTotals = () => {
        onUpdateCongTacRaDe(totalSoTietQuyChuan);
    };

    useEffect(() => {
        calculateTotals();
    }, [dataList]);

    const onSubmit = async (data) => {
        if (namHoc == '') {
            toast.error('Vui lòng nhập năm học!')
            return
        }
        if (ky == '') {
            toast.error('Vui lòng nhập học kỳ!')
            return
        }
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/work-hours/CongTacRaDe", {
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
                toast.success("Xóa thành công!");
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
            className: 'text-blue-600 font-medium',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            sorter: (a, b) => a.hocPhan.localeCompare(b.hocPhan),
            width: '20%'
        },
        {
            title: 'Số TC',
            dataIndex: 'soTC',
            key: 'soTC',
            align: 'center',
            width: '8%',
            sorter: (a, b) => a.soTC - b.soTC
        },
        {
            title: 'Lớp học phần',
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan',
            className: 'text-green-600 font-medium',
            render: (text) => <span className="text-green-600 font-medium">{text}</span>,
            sorter: (a, b) => a.lopHocPhan.localeCompare(b.lopHocPhan),
            width: '15%'
        },
        // {
        //     title: 'Học kỳ',
        //     dataIndex: 'hocKy',
        //     key: 'hocKy'
        // },
        {
            title: 'Hình thức thi',
            dataIndex: 'hinhThucThi',
            key: 'hinhThucThi',
            width: '15%',
            render: (text) => <span className="text-gray-700">{text}</span>,
            sorter: (a, b) => a.hinhThucThi.localeCompare(b.hinhThucThi)
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoiGianThi',
            key: 'thoiGianThi',
            align: 'center',
            width: '10%',
            render: (text) => <span>{text} phút</span>,
            sorter: (a, b) => a.thoiGianThi - b.thoiGianThi
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            className: 'text-red-600 font-medium',
            align: 'center',
            width: '12%',
            render: (text) => <span className="text-red-600 font-medium">{text}</span>,
            sorter: (a, b) => a.soTietQuyChuan - b.soTietQuyChuan
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '15%',
            ellipsis: true
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: '12%',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        onClick={() => handleEdit(record)}
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600 flex items-center"
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
                            size="small"
                            type="primary"
                            danger
                            className="flex items-center"
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
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
        <div className="flex gap-4 max-sm:flex-col h-full overflow-hidden">
            <div className="p-4 shadow-lg bg-white rounded-xl flex-[30%] border border-gray-100 overflow-auto">
                <div className="border-b border-blue-500 pb-2 mb-0">
                    <Title className="text-center text-blue-600" level={4}>CÔNG TÁC RA ĐỀ THI</Title>
                </div>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2">
                    <Space direction="vertical" className="w-full" size={0}>
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Học phần <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[60%] mb-2"
                                    validateStatus={errors.hocPhan ? 'error' : ''}
                                    help={errors.hocPhan?.message}
                                >
                                    <Controller
                                        name="hocPhan"
                                        control={control}
                                        rules={{ required: "Học phần là bắt buộc" }}
                                        render={({ field }) =>
                                            <Input
                                                className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                placeholder="Nhập học phần ..."
                                                {...field}
                                            />
                                        }
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Số TC <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[35%] mb-2"
                                    validateStatus={errors.soTC ? 'error' : ''}
                                    help={errors.soTC?.message}
                                >
                                    <Controller
                                        name="soTC"
                                        control={control}
                                        rules={{ required: "Số TC là bắt buộc", min: { value: 1, message: "Số TC phải lớn hơn 0" } }}
                                        render={({ field }) =>
                                            <InputNumber
                                                className="w-full rounded-md border-gray-300"
                                                min={1}
                                                {...field}
                                            />
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Lớp học phần <span className="text-red-600">*</span></span>}
                                    className="w-full mb-2"
                                    validateStatus={errors.lopHocPhan ? 'error' : ''}
                                    help={errors.lopHocPhan?.message}
                                >
                                    <Controller
                                        name="lopHocPhan"
                                        control={control}
                                        rules={{ required: "Lớp học phần là bắt buộc" }}
                                        render={({ field }) =>
                                            <Input
                                                className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                placeholder="Nhập lớp học phần ..."
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
                                    label={<span className="font-semibold text-base text-gray-700">Hình thức thi <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.hinhThucThi ? 'error' : ''}
                                    help={errors.hinhThucThi?.message}
                                >
                                    <Controller
                                        name="hinhThucThi"
                                        control={control}
                                        rules={{ required: "Hình thức thi là bắt buộc" }}
                                        render={({ field }) => (
                                            <Select
                                                showSearch
                                                allowClear
                                                className="w-full"
                                                placeholder="Chọn hình thức thi..."
                                                {...field}
                                                options={listOptions.map(item => ({
                                                    value: item.ten,
                                                    label: item.ten,
                                                }))}
                                                dropdownStyle={{ width: '400px' }}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Thời gian thi (Phút) <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.thoiGianThi ? 'error' : ''}
                                    help={errors.thoiGianThi?.message}
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
                                                {...field}
                                                className="w-full rounded-md border-gray-300 text-red-600 font-medium bg-gray-100"
                                                min={1}
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
                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                style={{ resize: 'none' }}
                                                {...field}
                                            />
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="text-center mt-0">
                            <Form.Item>
                                <Space size="middle">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 h-7 px-6 font-medium text-base"
                                    >
                                        {isSubmitting ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                    <Button
                                        type="default"
                                        danger
                                        onClick={onReset}
                                        disabled={isSubmitting}
                                        className="h-7 px-6 font-medium text-base"
                                    >
                                        Làm mới
                                    </Button>
                                </Space>
                            </Form.Item>
                        </div>
                    </Space>
                </Form>
            </div>

            <div className="px-4 py-3 shadow-lg bg-white rounded-xl flex-[70%] border border-gray-100 overflow-auto">
                <div className="border-b border-blue-500 pb-2 mb-4">
                    <Title className="text-center text-blue-600" level={4}>DANH SÁCH CÔNG TÁC RA ĐỀ THI</Title>
                </div>

                <Table
                    columns={columns}
                    dataSource={dataList}
                    rowKey="id"
                    pagination={{
                        current,
                        pageSize,
                        total: dataList.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                    }}
                    onChange={handleTableChange}
                    className="custom-table"
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                />

                <div className="text-center font-bold text-lg mt-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span>Tổng số tiết quy chuẩn: </span>
                    <span className="text-red-600 text-xl">{totalSoTietQuyChuan}</span>
                </div>
            </div>
        </div>
    );
};

export default ExamPreparationForm;
