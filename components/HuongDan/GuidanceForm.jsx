"use client";

import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../Loader";
import TableHuongDan from "./TableHuongDan";



const { Title } = Typography;

const formSchema = {
    noiDungCongViec: "",
    soSVSoNhom: 0,
    lopHocPhan: "",
    thoiGian: 0,
    soBuoi: 0,
    soTietQuyChuan: 0,
    tongCong: 0,
    ghiChu: "",
};

const GuidanceForm = ({ onUpdateCongTacHuongDan, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [dataListSelect, setDataListSelect] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(6);

    const [selectedTab, setSelectedTab] = useState('Danh sách công việc');
    const [loadings, setLoadings] = useState(true);

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

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/work-hours/CongTacHuongDan/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
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
    const fetchData2 = async () => {
        try {
            const res = await fetch(`/api/work-hours/select/huong-dan`, { /////////////////////////////////////
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataListSelect(data);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    useEffect(() => {
        if (!currentUser?._id) return;
        fetchData();
        fetchData2();
    }, [namHoc, ky]);

    const calculateTotals = () => {
        onUpdateCongTacHuongDan(totalSoTietQuyChuan);
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
            const res = await fetch("/api/work-hours/CongTacHuongDan", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();
                //if (editRecord && newData) {
                if (editRecord || dataList.some(item => item.noiDungCongViec === newData.noiDungCongViec)) {

                    setDataList(prevData => prevData.map(item => (item.noiDungCongViec === newData.noiDungCongViec ? newData : item)));
                } else {
                    setDataList(prevData => [...prevData, newData]);
                }
                toast.success("Lưu thành công!");
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
                toast.success("Xóa thành công");
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const columns = [
        {
            title: <span className="font-semibold">Nội dung công việc</span>,
            dataIndex: 'noiDungCongViec',
            key: 'noiDungCongViec',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            width: '25%',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Số SV/Số nhóm</span>,
            dataIndex: 'soSVSoNhom',
            key: 'soSVSoNhom',
            width: '10%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Lớp học phần</span>,
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan',
            render: (text) => <span className="text-green-600 font-medium">{text}</span>,
            width: '15%',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Thời gian</span>,
            dataIndex: 'thoiGian',
            key: 'thoiGian',
            width: '10%',
            align: 'center',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Số buổi</span>,
            dataIndex: 'soBuoi',
            key: 'soBuoi',
            width: '8%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Số tiết QC</span>,
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            render: (text) => <span className="text-red-600 font-bold">{text}</span>,
            width: '10%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Ghi chú</span>,
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '12%',
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

    const handleSelectChange = (value) => {
        setValue("soTietQuyChuan", value.soGio);
    };

    const handleTabChange = (key) => {
        setLoadings(true);
        setSelectedTab(key);
        setTimeout(() => {
            setLoadings(false);
        }, 500);
    };

    const totalSoTietQuyChuan = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-4 max-sm:flex-col h-full">
            <div className="p-3 px-5 shadow-lg bg-white rounded-xl border border-gray-100" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Title className="text-center text-blue-600" level={3}>CÔNG TÁC HƯỚNG DẪN</Title>
                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-4 mt-4">
                    <Space direction="vertical" className="w-full" size={0}>
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Nội dung công việc <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[60%] mb-2"
                                    validateStatus={errors.noiDungCongViec ? 'error' : ''}
                                    help={errors.noiDungCongViec?.message}
                                >
                                    <Controller
                                        name="noiDungCongViec"
                                        control={control}
                                        rules={{ required: "Nội dung công việc là bắt buộc" }}
                                        render={({ field }) => (
                                            <Select
                                                className="w-full"
                                                placeholder="Chọn hoặc nhập công việc mới..."
                                                {...field}
                                                options={dataListSelect.map(item => ({ label: item.tenCV, value: item.tenCV }))}
                                                onChange={(value) => {
                                                    const finalValue = Array.isArray(value) ? value[value.length - 1] : value;
                                                    field.onChange(finalValue);
                                                    const selectedItem = dataListSelect.find(item => item.tenCV === finalValue);
                                                    if (selectedItem) {
                                                        handleSelectChange(selectedItem);
                                                    } else {
                                                        setValue("soTietQuyChuan", 0);
                                                    }
                                                }}
                                                showSearch
                                                allowClear
                                                mode="tags"
                                                maxTagCount={1}
                                                tokenSeparators={[]}
                                                onSelect={(value) => {
                                                    field.onChange(value);
                                                }}
                                                style={{ width: '100%' }}
                                                dropdownStyle={{ width: '400px' }}
                                            />
                                        )}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Số SV/Số nhóm <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[35%] mb-2"
                                    validateStatus={errors.soSVSoNhom ? 'error' : ''}
                                    help={errors.soSVSoNhom?.message}
                                >
                                    <Controller
                                        name="soSVSoNhom"
                                        control={control}
                                        rules={{ required: "Số SV/Số nhóm là bắt buộc" }}
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
                            <div className="flex justify-between items-start gap-2 flex-wrap">
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Lớp học phần <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
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

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Thời gian</span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.thoiGian ? 'error' : ''}
                                    help={errors.thoiGian?.message}
                                >
                                    <Controller
                                        name="thoiGian"
                                        control={control}
                                        render={({ field }) =>
                                            <InputNumber
                                                className="w-full rounded-md border-gray-300"
                                                min={0}
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
                                    label={<span className="font-semibold text-base text-gray-700">Số buổi</span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.soBuoi ? 'error' : ''}
                                    help={errors.soBuoi?.message}
                                >
                                    <Controller
                                        name="soBuoi"
                                        control={control}
                                        render={({ field }) =>
                                            <InputNumber
                                                className="w-full rounded-md border-gray-300"
                                                min={0}
                                                {...field}
                                            />
                                        }
                                    />
                                </Form.Item>

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
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="mb-1">
                                <span className="font-semibold text-base text-gray-700">Ghi chú</span>
                            </div>
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
                        </div>

                        <div className="flex justify-center mt-4">
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 h-8 px-6 font-medium text-base"
                                >
                                    {isSubmitting ? "Đang xử lý..." : (editRecord ? "Cập nhật" : "Lưu")}
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
                            </Space>
                        </div>
                    </Space>
                </Form>
            </div>

            <div className="p-4 shadow-lg bg-white rounded-xl flex-[70%] text-center border border-gray-100 overflow-y-auto">
                <Tabs
                    activeKey={selectedTab}
                    onChange={handleTabChange}
                    type="card"
                    className="custom-tabs"
                    items={[
                        {
                            key: 'Danh sách công việc',
                            label: <span className="font-semibold text-base">DANH SÁCH CÔNG VIỆC</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <div>
                                    <Table
                                        columns={columns}
                                        dataSource={dataList}
                                        rowKey="id"
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
                                    />
                                    <div className="flex justify-center mt-5 bg-gray-50 p-2 rounded-lg">
                                        <span className="font-bold text-lg">Tổng số tiết quy chuẩn: <span className="text-red-600 text-lg font-bold">{totalSoTietQuyChuan}</span></span>
                                    </div>
                                </div>
                        },
                        {
                            key: 'Phụ lục công việc',
                            label: <span className="font-semibold text-base">PHỤ LỤC CÔNG VIỆC</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <TableHuongDan data={dataListSelect} />
                        }
                    ]}
                />

            </div>

        </div>
    );
};

export default GuidanceForm;
