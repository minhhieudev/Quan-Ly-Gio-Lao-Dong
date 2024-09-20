"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Radio, Table, Popconfirm, Tabs, Spin, Select } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import moment from 'moment';
import { useParams } from "next/navigation";
import Loader from "../Loader";
import TablePcCoiThi from "./TablePcCoiThi";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    ky: "",
    soTietQuyChuan: 0,
    ghiChu: "",
    hocPhan: '',
    thoiGianThi: '',
    ngayThi: ''
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const ExamMonitoringForm = ({ onUpdateCongTacCoiThi, namHoc, ky }) => {
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
    const [loading, setLoading] = useState(true);
    const { type } = useParams();

    const [selectedTab, setSelectedTab] = useState('Kết quả coi thi');
    const [loadings, setLoadings] = useState(true);


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
                const res = await fetch(`/api/work-hours/CongTacCoiThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}`, {
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
    
            const res = await fetch(`/api/giaovu/pc-coi-thi/get-for-gv/?namHoc=${namHoc}&gvGiangDay=${currentUser.username}`, {
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
        onUpdateCongTacCoiThi(totalSoTietQuyChuan);
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
            const res = await fetch("/api/work-hours/CongTacCoiThi", {
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
            const res = await fetch("/api/work-hours/CongTacCoiThi", {
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
            title: 'Học kỳ',
            dataIndex: 'ky',
            key: 'ky'
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQuyChuan',
            key: 'soTietQuyChuan'
        },
        {
            title: 'Học phần',
            dataIndex: 'hocPhan',
            key: 'hocPhan'
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoiGianThi',
            key: 'thoiGianThi'
        },
        {
            title: 'Ngày thi',
            dataIndex: 'ngayThi',
            key: 'ngayThi',
            render: (text) => moment(text).format('DD-MM-YYYY'),
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

    const handleTabChange = (key) => {
        setLoadings(true);
        setSelectedTab(key);
        setTimeout(() => {
            setLoadings(false);
        }, 500);
    };

    // Tính tổng số tiết quy chuẩn
    const totalSoTietQuyChuan = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
    }, [dataList]);


    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-5 max-sm:flex-col">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[25%]">
                <Title className="text-center" level={3}>CÔNG TÁC COI THI</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" >
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between items-center">
                            <Form.Item
                                label={<span className="font-bold text-xl">Học phần</span>}
                            >
                                <Controller
                                    name="hocPhan"
                                    control={control}
                                    render={({ field }) => <Input className="input-text" {...field} />}
                                />
                            </Form.Item>

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
                        </div>

                        <div className="flex justify-between">
                            <Form.Item
                                label={<span className="font-bold text-xl">Thời gian thi (Phút)</span>}
                            >
                                <Controller
                                    name="thoiGianThi"
                                    control={control}
                                    render={({ field }) => <InputNumber className="input-text" {...field} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Ngày thi</span>}
                            >
                                <Controller
                                    name="ngayThi"
                                    control={control}
                                    render={({ field }) => <Input className="input-text" type="date" {...field} />}
                                />
                            </Form.Item>
                        </div>
                        <div className="flex justify-between">
                            <Form.Item
                                label={<span className="font-bold text-xl">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soTietQuyChuan ? 'error' : ''}
                                help={errors.soTietQuyChuan?.message}
                            >
                                <Controller
                                    name="soTietQuyChuan"
                                    control={control}
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber className="input-number" min={1} {...field} />}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="font-bold text-xl">Ghi chú</span>}
                            >
                                <Controller
                                    name="ghiChu"
                                    control={control}
                                    render={({ field }) => <Input.TextArea className="input-text" rows={4} {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between">
                            <Button type="default" danger onClick={onReset}>Nhập lại</Button>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                {editRecord ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </div>
                    </Space>
                </Form>
            </div>

            <div className="p-2 shadow-xl bg-white rounded-xl flex-[75%] text-center">

                <Tabs activeKey={selectedTab} onChange={handleTabChange}>
                    <TabPane tab="KẾT QUẢ COI THI" key="Kết quả coi thi">
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
                                <div className="flex justify-center mt-4">
                                    <div className="font-bold text-xl">Tổng số tiết quy chuẩn: <span className="text-red-500 text-lg">{totalSoTietQuyChuan}</span></div>
                                </div>
                            </div>
                        }
                    </TabPane>
                    <TabPane tab="PHÂN CÔNG COI THI" key="Phân công coi thi" className="text-center">
                        {loadings ? <Spin size="large" /> : <TablePcCoiThi namHoc={namHoc || ''} ky={ky || ''} listSelect={listSelect || []} />}
                    </TabPane>
                </Tabs>

            </div>
        </div>
    );
};

export default ExamMonitoringForm;
