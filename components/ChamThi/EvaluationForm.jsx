"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Radio, Table, Popconfirm, Tabs, Spin, Select } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
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
    hinhThucThoiGianThi:""
};

const EvaluationForm = ({ onUpdateCongTacChamThi, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [listSelect, setListSelect] = useState([]);
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

    const soTietQuyChuan = watch("soTietQuyChuan");

    const [selectedTab, setSelectedTab] = useState('Kết quả chấm thi');
    const [loadings, setLoadings] = useState(true);


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
                const res = await fetch(`/api/work-hours/CongTacChamThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}`, {
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
    }, [currentUser]);

    useEffect(() => {
        if (!namHoc && !ky) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/giaovu/pc-cham-thi/get-for-gv/?namHoc=${namHoc}&gvGiangDay=${currentUser.username}`, {
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
    }, [namHoc, ky]);

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
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id, namHoc }),
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
            const res = await fetch("/api/work-hours/CongTacChamThi", {
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
            title: 'Học phần chấm thi',
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            className: 'text-blue-500 font-bold'
        },
        {
            title: 'Lớp học phần',
            dataIndex: 'lopHocPhan',
            key: 'lopHocPhan'
        },
        {
            title: 'Học kỳ',
            dataIndex: 'ky',
            key: 'ky'
        },
        {
            title: 'Cán bộ chấm thi',
            dataIndex: 'canBoChamThi',
            key: 'canBoChamThi'
        },
        {
            title: 'Số bài chấm',
            dataIndex: 'soBaiCham',
            key: 'soBaiCham'
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan',
            className: 'text-green-500 font-bold'
        },
        {
            title: 'Hình thức thi',
            dataIndex: 'hinhThucThoiGianThi',
            key: 'hinhThucThoiGianThi',
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
                <Space size="middle">
                    <Button onClick={() => handleEdit(record)} size="small" type="primary">Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá?"
                        onConfirm={() => handleDelete(record._id)} // Sử dụng ID để xoá
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" size="small" danger>Xoá</Button>
                    </Popconfirm>
                </Space>
            ),
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

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-5 max-sm:flex-col">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[30%]">
                <Title className="text-center" level={3}>CÔNG TÁC CHẤM THI</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-1 mt-10">
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between max-sm:flex-col">
                            <Form.Item
                                label={<span className="font-bold text-xl">Học phần chấm thi <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.hocPhan ? 'error' : ''}
                                help={errors.hocPhan?.message}
                            >
                                <Controller
                                    name="hocPhan"
                                    control={control}
                                    rules={{ required: "Học phần là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập tên học phần ..." {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Lớp học phần <span className="text-red-600">*</span></span>}
                                validateStatus={errors.lopHocPhan ? 'error' : ''}
                                help={errors.lopHocPhan?.message}
                            >
                                <Controller
                                    name="lopHocPhan"
                                    control={control}
                                    rules={{ required: "Lớp học phần là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập lớp ..." {...field} />}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Học kỳ <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.ky ? 'error' : ''}
                                help={errors.ky?.message}
                            >
                                <Controller
                                    name="ky"
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

                            <Form.Item
                                label={<span className="font-bold text-xl">Cán bộ chấm thi <span className="text-red-600">*</span></span>}
                                className="w-[40%]"
                                validateStatus={errors.canBoChamThi ? 'error' : ''}
                                help={errors.canBoChamThi?.message}
                            >
                                <Controller
                                    name="canBoChamThi"
                                    control={control}
                                    rules={{ required: "Cán bộ chấm thi là bắt buộc" }}
                                    render={({ field }) => (
                                        <Radio.Group {...field} className="font-semibold">
                                            <Radio value="1">1</Radio>
                                            <Radio value="2">2</Radio>
                                        </Radio.Group>
                                    )}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between">

                            <Form.Item
                                label={<span className="font-bold text-xl">Hình thức thi: <span className="text-red-600">*</span></span>}
                                validateStatus={errors.hinhThucThoiGianThi ? 'error' : ''}
                                help={errors.hinhThucThoiGianThi?.message}
                            >
                                <Controller
                                    name="hinhThucThoiGianThi"
                                    control={control}
                                    rules={{ required: "Hình thức thi là bắt buộc" }}
                                    render={({ field }) => (
                                        <Input className="input-text" placeholder="Nhập hình thức thi ..."  {...field} />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Số bài chấm <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soBaiCham ? 'error' : ''}
                                help={errors.soBaiCham?.message}
                            >
                                <Controller
                                    name="soBaiCham"
                                    control={control}
                                    rules={{ required: "Số bài chấm là bắt buộc" }}
                                    render={({ field }) => (
                                        <InputNumber className="input-number" min={0} {...field} />
                                    )}
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
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc" }}
                                    render={({ field }) => (
                                        <InputNumber className="input-number" min={0} {...field} />
                                    )}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={<span className="font-bold text-xl">Ghi chú</span>}
                        >
                            <Controller
                                name="ghiChu"
                                control={control}
                                render={({ field }) => <Input.TextArea className="input-text" rows={4} {...field} />}
                            />
                        </Form.Item>

                        <div className="flex justify-between">
                            <Button type="default" danger onClick={onReset}>Nhập lại</Button>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                {editRecord ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Space>
                </Form>
            </div>

            <div className="p-2 shadow-xl bg-white rounded-xl flex-[70%] text-center">

                <Tabs activeKey={selectedTab} onChange={handleTabChange}>
                    <TabPane tab="KẾT QUẢ CHẤM THI" key="Kết quả chấm thi">
                        {loadings ? <Spin size="large" /> :
                            <div>
                                <Table
                                    columns={columns}
                                    dataSource={dataList}
                                    pagination={{
                                        current,
                                        pageSize,
                                        total: dataList.length,
                                    }}
                                    onChange={handleTableChange}
                                    rowKey="id"
                                />
                                <div className="flex justify-center mt-5 text-lg">
                                    <span className="font-bold text-lg">Tổng số giờ:  <span className="text-red-500 text-lg">{totalHours}</span></span>
                                </div>
                            </div>
                        }
                    </TabPane>
                    <TabPane tab="PHÂN CÔNG CHẤM THI" key="Phân công chấm thi" className="text-center">
                        {loadings ? <Spin size="large" /> : <TablePcChamThi namHoc={namHoc || ''} ky={ky || ''} listSelect={listSelect || []} />}
                    </TabPane>
                </Tabs>

            </div>
        </div>
    );
};

export default EvaluationForm;
