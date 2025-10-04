"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Popconfirm, Radio, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../Loader";
import TablePcChamThi from "./TablePcChamThi";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    hocPhan: "",
    ky: "",
    lopHocPhan: "",
    canBoChamThi: '',
    soBaiCham: 0,
    soTietQuyChuan: 0,
    tongCong: 0,
    ghiChu: "",
    hinhThucThoiGianThi: ""
};

const EvaluationForm = ({ onUpdateCongTacChamThi, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [listSelect, setListSelect] = useState([]);
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

    const soTietQuyChuan = watch("soTietQuyChuan");

    const [selectedTab, setSelectedTab] = useState('Kết quả chấm thi');
    const [loadings, setLoadings] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newHocPhan, setNewHocPhan] = useState("");

    const [currentHocPhan, setCurrentHocPhan] = useState(null);

    const [listOptions, setListOptions] = useState([]);


    const handleAddNewClick = () => {
        setIsAddingNew(!isAddingNew);
    };

    const soBai = watch("soBaiCham");
    const hinhThucs = watch("hinhThuc");


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

    const handleSaveNewHocPhan = () => {
        const newHocPhanObj = {
            _id: Math.random().toString(36).substr(2, 9),
            hocPhan: newHocPhan,
            ky: "",
            lopHocPhan: "",
            canBoChamThi: '',
            soBaiCham: 0,
            soTietQuyChuan: 0,
            tongCong: 0,
            ghiChu: "",
            hinhThuc: "",
            thoiGian: ""
        };

        // Cập nhật listSelect với học phần mới
        setListSelect((prevListSelect) => [...prevListSelect, newHocPhanObj]);

        // Reset trạng thái thêm mới và input học phần
        setIsAddingNew(false);
        setNewHocPhan("");
    };

    useEffect(() => {
        if (editRecord) {
            reset(editRecord);
        } else {
            reset(formSchema);
        }
    }, [editRecord, reset]);

    useEffect(() => {
        setValue("tongCong", soTietQuyChuan);
    }, [soTietQuyChuan, setValue]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/work-hours/CongTacChamThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
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

        fetchData();
    }, [namHoc]);

    useEffect(() => {
        if (!namHoc && !ky) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/giaovu/pc-cham-thi/get-for-gv/?namHoc=${namHoc}&gvGiangDay=${currentUser?.username}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });


                if (res.ok) {
                    const data = await res.json();
                    setListSelect(data);
                    //setFilteredData(data);
                } else {
                    toast.error("Không thể tải dữ liệu");
                }
                setLoading(false);
            } catch (err) {
                console.log('Error:', err);
                toast.error("Lỗi khi tải dữ liệu");
                setLoading(false);
            }
        };

        fetchData();
    }, [namHoc]);

    const calculateTotals = () => {
        onUpdateCongTacChamThi(totalHours);
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
            const res = await fetch("/api/work-hours/CongTacChamThi", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();
                setDataList(prevData => {
                    const existingIndex = prevData.findIndex(item => item._id === newData._id);
                    if (existingIndex !== -1) {
                        // Update existing record
                        const updatedData = [...prevData];
                        updatedData[existingIndex] = newData;
                        return updatedData;
                    } else {
                        // Add new record
                        return [...prevData, newData];
                    }
                });
                toast.success("Lưu thành công!");
                onReset(); // Reset form after success
            } else {
                toast.error("Lưu thất bại!");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        }
    };
    const onReset = () => {
        setCurrentHocPhan(null)
        reset(formSchema);
        setEditRecord(null);
    };

    const handleEdit = (record) => {
        setEditRecord(record);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/work-hours/CongTacChamThi", {
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
            title: <span className="font-semibold">Học phần chấm thi</span>,
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            width: '20%',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">Lớp học phần</span>,
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan',
            width: '12%',
            ellipsis: true
        },

        {
            title: <span className="font-semibold">Cán bộ chấm thi</span>,
            dataIndex: 'canBoChamThi',
            key: 'canBoChamThi',
            width: '10%',
            align: 'center',
            render: (text) => <span>{text}</span>
        },
        {
            title: <span className="font-semibold">Số bài chấm</span>,
            dataIndex: 'soBaiCham',
            key: 'soBaiCham',
            width: '8%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">Số tiết QC</span>,
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            render: (text) => <span className="text-green-600 font-bold">{text}</span>,
            width: '10%',
            align: 'center'
        },
        {
            title: <span className="font-semibold">HT</span>,
            dataIndex: 'hinhThuc',
            key: 'hinhThuc',
            render: (text) => <span className="font-medium">{text}</span>,
            width: '8%',
            align: 'center',
            ellipsis: true
        },
        {
            title: <span className="font-semibold">TG</span>,
            dataIndex: 'thoiGian',
            key: 'thoiGian',
            render: (text) => <span className="font-medium">{text}</span>,
            width: '5%',
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
                            type="primary"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: '15%',
            align: 'center'
        },
    ];

    const totalHours = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);

    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
    };

    const handleTabChange = (key) => {
        setLoadings(true);
        setSelectedTab(key);
        setTimeout(() => {
            setLoadings(false);
        }, 500);
    };


    const handleSelectChange = (value) => {
        const selectedHocPhan = listSelect.find(item => item.hocPhan.toLowerCase() === value.toLowerCase());
        if (selectedHocPhan) {
            setCurrentHocPhan(selectedHocPhan)
            setValue("soBaiCham", selectedHocPhan.soBai);
            setValue("hinhThuc", selectedHocPhan.hinhThuc);
            setValue("thoiGian", selectedHocPhan.thoiGian);
            setValue("lopHocPhan", selectedHocPhan.nhomLop);

            if (selectedHocPhan.cb1 == currentUser?.username) {
                setValue('canBoChamThi', '1')
            }
            else if (selectedHocPhan.cb2 == currentUser?.username) {
                setValue('canBoChamThi', '2')
            }
            else {
                setValue('canBoChamThi', '')
            }
            //handleSelectChange2(selectedHocPhan.hinhThuc);
        }

    };

    useEffect(() => {
        handleSelectChange2(hinhThucs);
    }, [soBai, hinhThucs]);

    const handleSelectChange2 = (value) => {
        const selected = listOptions.find(item => item?.ten.toLowerCase() == value?.toLowerCase());

        if (selected) {
            const values = ((soBai * selected.soGio) / selected.soLuong).toFixed(3);
            setValue("soTietQuyChuan", values);
        } else {
            setValue("soTietQuyChuan", 0);
        }
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-4 max-sm:flex-col h-full overflow-hidden">
            <div className="py-2 px-4 shadow-lg bg-white rounded-xl flex-[30%] border border-gray-100 overflow-auto">
                <div className="border-b border-blue-500 pb-0 mb-0">
                    <Title className="text-center text-blue-600" level={3}>CÔNG TÁC CHẤM THI</Title>
                </div>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-0">
                    <Space direction="vertical" className="w-full text-base-medium" size="small">
                        <div className="flex justify-between max-sm:flex-col">
                            <div className="flex justify-between items-center w-full gap-3">
                                {!isAddingNew && (
                                    <Form.Item
                                        label={<span className="font-semibold text-base text-gray-700">Học phần <span className="text-red-600">*</span></span>}
                                        className="flex-1 mb-0"
                                        validateStatus={errors.hocPhan ? 'error' : ''}
                                        help={errors.hocPhan?.message}
                                    >
                                        <Controller
                                            name="hocPhan"
                                            control={control}
                                            rules={{ required: "Học phần là bắt buộc" }}
                                            render={({ field }) =>
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    className="rounded-md h-7"
                                                    style={{ width: '100%' }}
                                                    dropdownStyle={{ width: 'auto', minWidth: '350px' }}
                                                    listHeight={300}
                                                    placeholder="Nhập hoặc chọn tên học phần..."
                                                    {...field}
                                                    options={listSelect
                                                        .filter((item, index, self) =>
                                                            index === self.findIndex(t => t.hocPhan === item.hocPhan)
                                                        )
                                                        .map(item => ({
                                                            value: item.hocPhan,
                                                            label: item.hocPhan,
                                                            className: 'text-base py-1'
                                                        }))}
                                                    filterOption={(input, option) =>
                                                        option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        handleSelectChange(value);
                                                    }}
                                                />
                                            }
                                        />
                                    </Form.Item>
                                )}
                                {isAddingNew && (
                                    <Form.Item
                                        label={<span className="font-semibold text-base text-gray-700">Thêm học phần mới</span>}
                                        className="flex w-full mb-0 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                                    >
                                        <Space className="flex w-[90%]">
                                            <Input
                                                value={newHocPhan}
                                                onChange={(e) => setNewHocPhan(e.target.value)}
                                                placeholder="Nhập tên học phần mới..."
                                                className="min-w-0 rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                            />
                                            <Button
                                                size="small"
                                                type="primary"
                                                onClick={handleSaveNewHocPhan}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Lưu
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                )}
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Thêm</span>}
                                    className="w-auto mb-0"
                                >
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddNewClick}
                                        className="ml-2 flex-shrink-0"
                                    />
                                </Form.Item>

                            </div>



                        </div>
                        <div className="flex justify-between items-center gap-4 bg-gray-50 p-2 rounded-lg mb-1">
                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Cán bộ chấm thi <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.canBoChamThi ? 'error' : ''}
                                help={errors.canBoChamThi?.message}
                            >
                                <Controller
                                    name="canBoChamThi"
                                    control={control}
                                    rules={{ required: "Cán bộ chấm thi là bắt buộc" }}
                                    render={({ field }) => (
                                        <Radio.Group {...field} className="font-medium flex h-7">
                                            <Radio value="1">1</Radio>
                                            <Radio value="2">2</Radio>
                                        </Radio.Group>
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Lớp <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.lopHocPhan ? 'error' : ''}
                                help={errors.lopHocPhan?.message}
                            >
                                <Controller
                                    name="lopHocPhan"
                                    control={control}
                                    rules={{ required: "Lớp học phần là bắt buộc" }}
                                    render={({ field }) => <Input
                                        className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500 h-7"
                                        placeholder="Nhập lớp..."
                                        {...field}
                                    />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between gap-4 bg-gray-50 p-2 rounded-lg mb-1">
                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Thời gian (phút) <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.thoiGian ? 'error' : ''}
                                help={errors.thoiGian?.message}
                            >
                                <Controller
                                    name="thoiGian"
                                    control={control}
                                    render={({ field }) =>
                                        <Select
                                            placeholder="Chọn thời gian thi..."
                                            allowClear
                                            className="w-full rounded-md h-7"
                                            {...field}
                                            options={[
                                                { value: '45', label: '45 phút' },
                                                { value: '60', label: '60 phút' },
                                                { value: '90', label: '90 phút' },
                                                { value: '120', label: '120 phút' },
                                                { value: '180', label: '180 phút' }
                                            ]}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                        />
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Hình thức thi <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.hinhThuc ? 'error' : ''}
                                help={errors.hinhThuc?.message}
                            >
                                <Controller
                                    name="hinhThuc"
                                    control={control}
                                    rules={{ required: "Hình thức thi là bắt buộc" }}
                                    render={({ field }) => (
                                        <Select
                                            showSearch
                                            allowClear
                                            className="w-full rounded-md h-7"
                                            placeholder="Chọn hình thức thi..."
                                            {...field}
                                            options={listOptions.map(item => ({
                                                value: item.ten,
                                                label: item.ten,
                                                className: 'text-base py-1'
                                            }))}
                                            filterOption={(input, option) =>
                                                option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            onChange={(value) => {
                                                field.onChange(value);
                                                handleSelectChange2(value);
                                            }}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex justify-between gap-4 bg-gray-50 p-2 rounded-lg mb-1">
                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Số bài chấm <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.soBaiCham ? 'error' : ''}
                                help={errors.soBaiCham?.message}
                            >
                                <Controller
                                    name="soBaiCham"
                                    control={control}
                                    rules={{ required: "Số bài chấm là bắt buộc" }}
                                    render={({ field }) => (
                                        <InputNumber
                                            className="w-full h-7 rounded-md border-gray-300"
                                            min={0}
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                className="w-1/2 mb-0"
                                validateStatus={errors.soTietQuyChuan ? 'error' : ''}
                                help={errors.soTietQuyChuan?.message}
                            >
                                <Controller
                                    name="soTietQuyChuan"
                                    control={control}
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc" }}
                                    render={({ field }) => (
                                        <InputNumber
                                            className="w-full h-7 rounded-md border-gray-300 bg-gray-100"
                                            min={0}
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </div>

                        <div className="mb-0 flex">
                            <div className="mb-0 w-[30%]">
                                <span className="font-semibold text-small-bold text-gray-700">Ghi chú:</span>
                            </div>
                            <Controller
                                name="ghiChu"
                                control={control}
                                render={({ field }) =>
                                    <Input.TextArea
                                        className=" rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500 "
                                        placeholder="Nhập ghi chú nếu cần..."
                                        autoSize={{ minRows: 1, maxRows: 3 }}
                                        style={{ resize: 'none' }}
                                        {...field}
                                    />
                                }
                            />
                        </div>

                        <div className="flex justify-center mt-2">
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 h-7 px-6 font-medium text-base"
                                >
                                    {editRecord ? "Cập nhật" : "Lưu"}
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
                        </div>
                    </Space>
                </Form>
            </div>

            <div className="p-4 shadow-lg bg-white rounded-xl flex-[70%] text-center border border-gray-100 overflow-auto">
                <Tabs
                    activeKey={selectedTab}
                    onChange={handleTabChange}
                    type="card"
                    className="custom-tabs"
                    items={[
                        {
                            key: 'Kết quả chấm thi',
                            label: <span className="font-semibold text-base">KẾT QUẢ CHẤM THI</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <div>
                                    <Table
                                        columns={columns}
                                        dataSource={dataList}
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
                                        size="small"
                                        className="custom-table"
                                        rowKey="id"
                                        scroll={{ x: 'max-content' }}
                                    />
                                    <div className="flex justify-center mt-3 bg-gray-50 p-2 rounded-lg">
                                        <span className="font-bold text-lg">Tổng số giờ:  <span className="text-red-600 text-lg font-bold">{totalHours.toFixed(2)}</span></span>
                                    </div>
                                </div>
                        },
                        {
                            key: 'Phân công chấm thi',
                            label: <span className="font-semibold text-base">PHÂN CÔNG CHẤM THI</span>,
                            children: loadings ?
                                <div className="flex justify-center items-center h-40">
                                    <Spin size="large" />
                                </div> :
                                <TablePcChamThi
                                    namHoc={namHoc || ''}
                                    ky={ky || ''}
                                    listSelect={listSelect || []}
                                />
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default EvaluationForm;
