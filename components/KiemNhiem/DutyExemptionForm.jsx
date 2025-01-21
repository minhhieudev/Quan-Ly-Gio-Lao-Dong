"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Spin, Select, Tabs, Table, Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Loader from "../Loader";
import TableKiemNhiem from "./TableKiemNhiem";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    chucVuCongViec: "",
    thoiGianTinh: "",
    tyLeMienGiam: 0,
    soTietQC: 0,
    ghiChu: "",
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const DutyExemptionForm = ({ onUpdateCongTacKiemNhiem, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(6);
    const router = useRouter();
    const [loadings, setLoadings] = useState(true);
    const [dataListSelect, setDataListSelect] = useState([]);
    const [listChucVu, setListChucVu] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Danh sách công việc');


    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });


    const { data: session } = useSession();
    const currentUser = session?.user;

    const { type } = useParams();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editRecord) {
            reset(editRecord);
        } else {
            reset(formSchema);
        }
    }, [editRecord, reset]);

    useEffect(() => {
        const result = currentUser.maNgachInfo.GCGD * watch("tyLeMienGiam")
        setValue("soTietQC", result);

    }, [watch("tyLeMienGiam"), setValue]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/work-hours/CongTacKiemNhiem/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}`, {
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
        const fetchData2 = async () => {
            try {
                const res = await fetch(`/api/work-hours/select/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}`, {
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
        const fetchData3 = async () => {
            try {
                const res = await fetch(`/api/work-hours/select/chuc-vu`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                    const data = await res.json();
                    setListChucVu(data);
                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (err) {
                toast.error("An error occurred while fetching data");
            }
        };

        fetchData2();
        fetchData3();

        fetchData();
    }, [currentUser]);

    const calculateTotals = () => {
        onUpdateCongTacKiemNhiem(totalHours);
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
            const res = await fetch("/api/work-hours/CongTacKiemNhiem", {
                method,
                body: JSON.stringify({ ...data, type, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
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
            const res = await fetch("/api/work-hours/CongTacKiemNhiem", {
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
            title: 'Chức vụ, công việc',
            dataIndex: 'chucVuCongViec',
            key: 'chucVuCongViec',
            className: 'text-blue-500 font-bold'
        },
        {
            title: 'Thời gian tính',
            dataIndex: 'thoiGianTinh',
            key: 'thoiGianTinh'
        },
        {
            title: 'Tỷ lệ % miễn giảm',
            dataIndex: 'tyLeMienGiam',
            key: 'tyLeMienGiam'
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQC',
            key: 'soTietQC',
            className: 'text-green-500 font-bold'
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
                        onConfirm={() => handleDelete(record._id)} // Sử dụng ID để xoá
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

    const totalHours = useMemo(() => {
        return dataList.reduce((total, item) => total + (item.soTietQC || 0), 0);
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
        setValue("tyLeMienGiam", value.soMien);
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col h-full">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[20%]">
                <Title className="text-center" level={3}>CÔNG TÁC KIÊM NHIỆM</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-8 mt-10">
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between max-sm:flex-col">
                            <Form.Item
                                label={<span className="font-bold text-xl">Chức vụ, công việc được miễn giảm hoặc tính giờ <span className="text-red-600">*</span></span>}
                                className="w-[50%]"
                                validateStatus={errors.chucVuCongViec ? 'error' : ''}
                                help={errors.chucVuCongViec?.message}
                            >
                                <Controller
                                    name="chucVuCongViec"
                                    control={control}
                                    rules={{ required: "Chức vụ, công việc là bắt buộc" }}
                                    render={({ field }) => (
                                        <Select
                                            className="input-select"
                                            placeholder="Chọn công việc, chức vụ ..."
                                            {...field}
                                            options={dataListSelect.map(item => ({ label: item.chucVu.tenCV, value: item.chucVu.tenCV }))}
                                            onChange={(value) => {
                                                field.onChange(value); // Cập nhật giá trị cho Controller
                                                const selectedItem = listChucVu.find(item => item.tenCV === value); // Lấy item đầy đủ
                                                handleSelectChange(selectedItem); // Gọi hàm với item đầy đủ
                                            }}
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Thời gian được tính <span className="text-red-600">*</span></span>}
                                validateStatus={errors.thoiGianTinh ? 'error' : ''}
                                help={errors.thoiGianTinh?.message}
                            >
                                <Controller
                                    name="thoiGianTinh"
                                    control={control}
                                    rules={{ required: "Thời gian được tính là bắt buộc" }}
                                    render={({ field }) => <Input className="input-text" placeholder="Nhập thời gian được tính ..." {...field} />}
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between">
                            <Form.Item
                                label={<span className="font-bold text-xl">Tỷ lệ % miễn giảm <span className="text-red-600">*</span></span>}
                                validateStatus={errors.tyLeMienGiam ? 'error' : ''}
                                help={errors.tyLeMienGiam?.message}
                            >
                                <Controller
                                    name="tyLeMienGiam"
                                    control={control}
                                    rules={{ required: "Tỷ lệ % miễn giảm là bắt buộc", min: { value: 0, message: "Tỷ lệ % miễn giảm không được âm" }, max: { value: 100, message: "Tỷ lệ % miễn giảm không được vượt quá 100" } }}
                                    render={({ field }) => <InputNumber {...field} className="input-number" />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                validateStatus={errors.soTietQC ? 'error' : ''}
                                help={errors.soTietQC?.message}
                            >
                                <Controller
                                    name="soTietQC"
                                    control={control}
                                    rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                    render={({ field }) => <InputNumber {...field} className="input-number" />}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item label={<span className="font-bold text-xl">Ghi chú</span>}>
                            <Controller
                                name="ghiChu"
                                control={control}
                                render={({ field }) => <Input className="input-text" {...field} />}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Lưu"}
                            </Button>
                            <Button type="default" danger onClick={onReset} disabled={isSubmitting}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="p-2 shadow-xl bg-white rounded-xl flex-[70%] text-center">

                <Tabs activeKey={selectedTab} onChange={handleTabChange}>
                    <TabPane tab="DANH SÁCH CÔNG VIỆC" key="Danh sách công việc" className="text-center">
                        {loading ? <Spin size="large" /> :
                            <Table
                                columns={columns}
                                dataSource={dataList}
                                rowKey="id"
                                pagination={{
                                    current,
                                    pageSize,
                                    total: dataList.length,
                                    onChange: (page) => setCurrent(page),
                                }}
                                onChange={handleTableChange}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={3} className="font-bold text-lg text-right">
                                            Tổng số tiết quy chuẩn:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell className="font-bold text-lg text-red-600">{totalHours}</Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />

                        }

                    </TabPane>
                    <TabPane tab="PHỤ LỤC CÔNG VIỆC" key="Phụ lục công việc" className="text-center">
                        {loadings ? <Spin size="large" /> : <TableKiemNhiem data={dataListSelect} />}
                    </TabPane>
                </Tabs>

            </div>

        </div>
    );
};

export default DutyExemptionForm;
