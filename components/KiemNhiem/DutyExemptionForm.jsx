"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Spin, Select, Tabs, Table, Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Loader from "../Loader";
import TableKiemNhiem from "./TableKiemNhiem";
import TextArea from "antd/es/input/TextArea";

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
    const [loadings, setLoadings] = useState(true);
    const [dataListSelect, setDataListSelect] = useState([]);
    const [dataTong, setDataTong] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Danh sách công việc');
    const [resultsDisplay, setResultsDisplay] = useState([]);

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

    const tyLeMienGiam = useWatch({ control, name: "tyLeMienGiam" });

    useEffect(() => {
        if (!currentUser?.maNgachInfo?.GCGD) return;
        let result;
        if (tyLeMienGiam < 1) {
            result = currentUser.maNgachInfo.GCGD * tyLeMienGiam;
        } else {
            result = tyLeMienGiam;
        }
        // Chỉ setValue nếu giá trị thực sự thay đổi để tránh vòng lặp
        setValue("soTietQC", result, { shouldValidate: false, shouldDirty: false });
    }, [tyLeMienGiam, setValue, currentUser]);

    useEffect(() => {
        if (!currentUser?._id) return;
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/work-hours/CongTacKiemNhiem/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
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

        //DỮ LIỆU PHỤ LỤC
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
        fetchData2();
        fetchData();


    }, []);

    const calculateTotals = () => {
        onUpdateCongTacKiemNhiem(totalHours);
    };

    useEffect(() => {
        if (dataListSelect && dataListSelect.length > 0) {
            handelKiemNhiem();
        } else {
            setResultsDisplay([]);
            setDataTong([]);
        }
    }, [dataListSelect]);

    const handelKiemNhiem = () => {
        // Nếu không có dữ liệu thì return luôn, tránh xử lý tiếp
        if (!dataListSelect || dataListSelect.length === 0) {
            setResultsDisplay([]);
            setDataTong([]);
            return;
        }

        // Lấy giá trị schoolYearStart và schoolYearEnd từ phần tử đầu tiên của dataListSelect (nếu có)
        let dau_nam, cuoi_nam;

        if (dataListSelect && dataListSelect.length > 0 && dataListSelect[0].schoolYearStart && dataListSelect[0].schoolYearEnd) {
            dau_nam = new Date(dataListSelect[0].schoolYearStart);
            cuoi_nam = new Date(dataListSelect[0].schoolYearEnd);
        }
        // else {
        //     // Giá trị mặc định nếu không tìm thấy trong dữ liệu
        //     dau_nam = new Date('2025-10'); // Tháng bắt đầu (tháng 10 năm 2024)
        //     cuoi_nam = new Date('2026-5'); // Tháng kết thúc (tháng 5 năm 2025)
        // }

        const events = [];
        let flat = false

        // Tạo danh sách sự kiện từ dataListSelect
        dataListSelect.forEach((item) => {
            if (item.startTime && item.chucVu?.soMien !== undefined) {
                //if (item.loai === 'bo-qua') return;

                const dateStart = new Date(item.startTime);
                // Nếu không có endTime thì lấy schoolYearEnd
                const dateEnd = item.endTime ? new Date(item.endTime) : new Date(dataListSelect[0].schoolYearEnd);

                const yearMonthStart = `${dateStart.getFullYear()}-${(dateStart.getMonth() + 1).toString().padStart(2, '0')}`;
                const yearMonthEnd = `${dateEnd.getFullYear()}-${(dateEnd.getMonth() + 1).toString().padStart(2, '0')}`;

                const GCGD = Number(currentUser.maNgachInfo.GCGD);
                let gValue;

                // if (item.chucVu.soMien === -1) {
                //     // Trường hợp -1: Tính bằng GCGD * 0.5
                //     gValue = GCGD * 0.5;
                // } 
                // else if (item.chucVu.soMien === -2) {
                //     // Trường hợp -2: Tính bằng số tuần * GCGD / 44
                //     const diffTime = Math.abs(dateEnd - dateStart);
                //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                //     const weeks = diffDays / 7;
                //     gValue = (weeks * GCGD) / 44;
                // }


                if (item.chucVu.soMien < 1) {
                    // Trường hợp < 1 (nhưng không phải -1 hoặc -2)
                    gValue = item.chucVu.soMien * GCGD;
                }
                else {
                    // Trường hợp >= 1
                    gValue = item.chucVu.soMien;
                }

                if (dateStart.getMonth() < dau_nam.getMonth() && dateStart.getFullYear() == dau_nam.getFullYear()) {
                    const yearMonthStart = `${dateStart.getFullYear()}-${(dau_nam.getMonth() + 1).toString().padStart(2, '0')}`;
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }
                else {
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }

                if (dateEnd.getMonth() > cuoi_nam.getMonth() && dateEnd.getFullYear() === cuoi_nam.getFullYear()) {
                    const yearMonthEnd = `${dateStart.getFullYear()}-${(cuoi_nam.getMonth() + 1).toString().padStart(2, '0')}`;
                    events.push({ time: yearMonthEnd, type: "end", gValue });
                }
                else {
                    events.push({ time: yearMonthEnd, type: "end", gValue });
                }


            }
        });
        // Sắp xếp dựa trên giá trị thời gian
        events.sort((a, b) => {
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return dateA - dateB;
        });

        console.log(events);

        let previousTime = null;
        let currentMax = 0;
        const activeValues = [];
        const results = [];

        // Duyệt qua các sự kiện
        events.forEach((event) => {
            const { time, type, gValue } = event;

            // Lưu kết quả nếu có khoảng thời gian trước đó
            if (previousTime !== null && time > previousTime) {
                results.push({ from: previousTime, to: time, max: currentMax });
            }

            // Cập nhật thời gian trước đó
            previousTime = time;

            // Xử lý sự kiện
            if (type === "start") {
                activeValues.push(gValue);
            } else if (type === "end") {
                const index = activeValues.indexOf(gValue);
                if (index > -1) activeValues.splice(index, 1);
            }

            // Cập nhật giá trị gmax
            currentMax = activeValues.length ? Math.max(...activeValues) : 0;
        });

        console.log(
            "Danh sách kết quả:",
            results.map((r) => ({
                from: new Date(r.from).toLocaleDateString("vi-VN"),
                to: new Date(r.to).toLocaleDateString("vi-VN"),
                max: r.max,
            }))
        );

        // Cập nhật state với kết quả
        setResultsDisplay(results.map((r) => ({
            from: new Date(r.from).toLocaleDateString("vi-VN"),
            to: new Date(r.to).toLocaleDateString("vi-VN"),
            max: r.max,
        })));

        setDataTong(results)
        return results;
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
                body: JSON.stringify({ ...data, type, user: currentUser._id, id: editRecord?._id, namHoc }),
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
            className: 'text-blue-600 font-medium',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            sorter: (a, b) => a.chucVuCongViec.localeCompare(b.chucVuCongViec),
            width: '20%'
        },
        {
            title: 'Thời gian tính',
            dataIndex: 'thoiGianTinh',
            key: 'thoiGianTinh',
            width: '15%',
            render: (text) => <span className="text-gray-700">{text}</span>,
            sorter: (a, b) => a.thoiGianTinh.localeCompare(b.thoiGianTinh)
        },
        {
            title: 'Tỷ lệ % miễn giảm',
            dataIndex: 'tyLeMienGiam',
            key: 'tyLeMienGiam',
            align: 'center',
            width: '12%',
            render: (text) => <span>{text}%</span>,
            sorter: (a, b) => a.tyLeMienGiam - b.tyLeMienGiam
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQC',
            key: 'soTietQC',
            className: 'text-red-600 font-medium',
            align: 'center',
            width: '12%',
            render: (text) => <span className="text-red-600 font-medium">{text}</span>,
            sorter: (a, b) => a.soTietQC - b.soTietQC
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
            width: '15%',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        onClick={() => handleEdit(record)}
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600 flex items-center"
                        icon={<span className="mr-1">✏️</span>}
                    >
                        Sửa
                    </Button>
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
                            icon={<span className="mr-1">🗑️</span>}
                        >
                            Xoá
                        </Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    const totalHours = useMemo(() => {
        //return dataList.reduce((total, item) => total + (item.soTietQC || 0), 0);

        return dataTong.reduce((acc, item) => acc + item.max, 0);
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
        setValue("tyLeMienGiam", value?.tyLeMienGiam);
        setValue("ghiChu", value?.ghiChu);
        setValue("chucVuCongViec", value?.chucVuCongViec);
        setValue("thoiGianTinh", value?.thoiGianTinh);
        setValue("soTietQC", value?.soTietQC);
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-4 max-sm:flex-col h-full">
            <div className="p-3 shadow-lg bg-white rounded-xl flex-[30%] border border-gray-100">
                <div className="border-b border-blue-500 pb-2 mb-2">
                    <Title className="text-center text-blue-600" level={3}>CÔNG TÁC KIÊM NHIỆM</Title>
                </div>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 mt-4">
                    <Space direction="vertical" className="w-full" size={0}>
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Chức vụ, công việc <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.chucVuCongViec ? 'error' : ''}
                                    help={errors.chucVuCongViec?.message}
                                >
                                    <Controller
                                        name="chucVuCongViec"
                                        control={control}
                                        rules={{ required: "Chức vụ, công việc là bắt buộc" }}
                                        render={({ field }) => (
                                            <Select
                                                allowClear
                                                className="w-full"
                                                placeholder="Chọn công việc, chức vụ ..."
                                                {...field}
                                                options={dataList.map(item => ({ label: item.chucVuCongViec, value: item._id }))}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    handleSelectChange(dataList.find(item => item._id === value));
                                                }}
                                                dropdownStyle={{ width: '400px' }}
                                            />
                                        )}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Thời gian được tính <span className="text-red-600">*</span></span>}
                                    validateStatus={errors.thoiGianTinh ? 'error' : ''}
                                    help={errors.thoiGianTinh?.message}
                                    className="w-full md:w-[48%] mb-2"
                                >
                                    <Controller
                                        name="thoiGianTinh"
                                        control={control}
                                        rules={{ required: "Thời gian được tính là bắt buộc" }}
                                        render={({ field }) =>
                                            <Input
                                                className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                                placeholder="Nhập thời gian được tính ..."
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
                                    label={<span className="font-semibold text-base text-gray-700">Tỷ lệ % miễn giảm <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.tyLeMienGiam ? 'error' : ''}
                                    help={errors.tyLeMienGiam?.message}
                                >
                                    <Controller
                                        name="tyLeMienGiam"
                                        control={control}
                                        rules={{ required: "Tỷ lệ % miễn giảm là bắt buộc", min: { value: 0, message: "Tỷ lệ % miễn giảm không được âm" }, max: { value: 100, message: "Tỷ lệ % miễn giảm không được vượt quá 100" } }}
                                        render={({ field }) =>
                                            <InputNumber
                                                {...field}
                                                className="w-full rounded-md border-gray-300"
                                                min={0}
                                                max={100}
                                                addonAfter="%"
                                            />
                                        }
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-semibold text-base text-gray-700">Số tiết quy chuẩn <span className="text-red-600">*</span></span>}
                                    className="w-full md:w-[48%] mb-2"
                                    validateStatus={errors.soTietQC ? 'error' : ''}
                                    help={errors.soTietQC?.message}
                                >
                                    <Controller
                                        name="soTietQC"
                                        control={control}
                                        rules={{ required: "Số tiết quy chuẩn là bắt buộc", min: { value: 1, message: "Số tiết quy chuẩn phải lớn hơn 0" } }}
                                        render={({ field }) =>
                                            <InputNumber
                                                {...field}
                                                className="w-full rounded-md border-gray-300 text-red-600 font-medium"
                                                min={1}
                                            />
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                            <Form.Item
                                label={<span className="font-semibold text-base text-gray-700">Ghi chú</span>}
                                className="mb-0"
                            >
                                <Controller
                                    name="ghiChu"
                                    control={control}
                                    render={({ field }) =>
                                        <TextArea
                                            className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                                            placeholder="Nhập ghi chú nếu cần..."
                                            autoSize={{ minRows: 2, maxRows: 4 }}
                                            style={{ resize: 'none' }}
                                            {...field}
                                        />
                                    }
                                />
                            </Form.Item>
                        </div>
                    </Space>

                    <div className="text-center mt-5">
                        <Form.Item>
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 rounded-md px-6 h-10 flex items-center justify-center"
                                    icon={<span className="mr-1">💾</span>}
                                >
                                    {isSubmitting ? "Đang lưu..." : "Lưu"}
                                </Button>
                                <Button
                                    type="default"
                                    danger
                                    onClick={onReset}
                                    disabled={isSubmitting}
                                    className="border-gray-300 hover:border-red-500 rounded-md px-6 h-10 flex items-center justify-center"
                                    icon={<span className="mr-1">🔄</span>}
                                >
                                    Làm mới
                                </Button>
                            </Space>
                        </Form.Item>
                    </div>
                </Form>
            </div>

            <div className="px-6 py-4 shadow-lg bg-white rounded-xl flex-[65%] border border-gray-100">
                <div className="border-b border-blue-500 pb-2 mb-4">
                    <Title className="text-center text-blue-600" level={3}>QUẢN LÝ CÔNG TÁC KIÊM NHIỆM</Title>
                </div>

                <Tabs
                    activeKey={selectedTab}
                    onChange={handleTabChange}
                    type="card"
                    className="custom-tabs"
                >
                    <TabPane
                        tab={<span className="px-2 py-1 font-medium">DANH SÁCH CÔNG VIỆC</span>}
                        key="Danh sách công việc"
                        className="text-center p-2"
                    >
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
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                                }}
                                onChange={handleTableChange}
                                className="custom-table"
                                bordered
                                size="middle"
                                scroll={{ x: 'max-content' }}
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
                    <TabPane
                        tab={<span className="px-2 py-1 font-medium">PHỤ LỤC CÔNG VIỆC</span>}
                        key="Phụ lục công việc"
                        className="text-center p-2"
                    >
                        {loadings ? <Spin size="large" /> : <TableKiemNhiem data={dataListSelect || []} />}
                    </TabPane>
                </Tabs>
            </div>

            {resultsDisplay.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-4 shadow-lg border border-gray-100">
                    <div className="border-b border-blue-500 pb-2 mb-3">
                        <h3 className="text-lg font-semibold text-blue-600 text-center">Kết quả tính toán miễn giảm</h3>
                    </div>
                    <div className="overflow-auto max-h-60">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-200 px-3 py-2 text-left">STT</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Từ ngày</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Đến ngày</th>
                                    <th className="border border-gray-200 px-3 py-2 text-center">Số tiết miễn giảm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultsDisplay.map((result, index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="border border-gray-200 px-3 py-2">{index + 1}</td>
                                        <td className="border border-gray-200 px-3 py-2 text-green-600 font-medium">{result.from}</td>
                                        <td className="border border-gray-200 px-3 py-2 text-blue-600 font-medium">{result.to}</td>
                                        <td className="border border-gray-200 px-3 py-2 text-center text-red-600 font-medium">{result.max}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DutyExemptionForm;

