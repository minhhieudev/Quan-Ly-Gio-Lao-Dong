"use client";

import { SaveOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Form, Popconfirm, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../Loader";
import TableKiemNhiem from "./TableKiemNhiem";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    chucVu: "",
    startTime: "",
    user: "",
    endTime: "",
    ghiChu: ''
};


const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const DutyExemptionForm = ({ onUpdateCongTacKiemNhiem, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6); // Sửa lại, không phải const
    const [loadings, setLoadings] = useState(true);
    const [dataListSelect, setDataListSelect] = useState([]);
    const [dataListSelect2, setDataListSelect2] = useState([]);
    const [dataTong, setDataTong] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Danh sách công việc');
    const [resultsDisplay, setResultsDisplay] = useState([]);
    const [finalResult, setFinalResult] = useState(0);

    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });

    const { data: session } = useSession();
    const currentUser = session?.user;

    const { type } = useParams();

    const [loading, setLoading] = useState(false);

    const [schoolYearStart, setSchoolYearStart] = useState(null);
    const [schoolYearEnd, setSchoolYearEnd] = useState(null);
    const [listChucVu, setListChucVu] = useState([]);
    const [listUser, setListUser] = useState([]);

    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                const res = await fetch('/api/admin/setting');
                const data = await res.json();
                if (data && data.length > 0) {
                    setSchoolYearStart(data[0].schoolYearStart ? dayjs(data[0].schoolYearStart) : null);
                    setSchoolYearEnd(data[0].schoolYearEnd ? dayjs(data[0].schoolYearEnd) : null);
                }
            } catch (err) {
                // Có thể show message lỗi nếu cần
            }
        };
        fetchSchoolYear();
    }, []);

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


    const fetchData2 = async () => {
        try {
            const res = await fetch(`/api/work-hours/select/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('DATA:', data)

                // Lọc các item có soMien === -1 hoặc maCV bắt đầu bằng 'NGHIDH'
                const listNghiDH = data.filter(
                    item => item.chucVu?.soMien === -1
                    // item => item.chucVu?.soMien === -1 || item.chucVu?.maCV?.startsWith('NGHIDH')
                );
                // // Các item còn lại
                // const listKhac = data.filter(
                //     item => !(item.chucVu?.soMien === -1)
                //     // item => !(item.chucVu?.soMien === -1 || item.chucVu?.maCV?.startsWith('NGHIDH'))
                // );

                setDataListSelect(data);
                setDataListSelect2(listNghiDH);

            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

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

        fetchData2();
        fetchData();


    }, [namHoc]);

    const calculateTotals = () => {
        onUpdateCongTacKiemNhiem(finalResult);
    };

    useEffect(() => {
        if (dataListSelect && dataListSelect.length > 0) {
            const result = handelKiemNhiem();
            setFinalResult(result);
        } else {
            // Chỉ reset nếu thực sự có dữ liệu cũ
            if (resultsDisplay.length !== 0) setResultsDisplay([]);
            if (dataTong.length !== 0) setDataTong([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataListSelect]);

    const handelKiemNhiem = () => {
        if (!dataListSelect || dataListSelect.length === 0) {
            return;
        }
        // Nếu không có dữ liệu thì return luôn, tránh xử lý tiếp
        if (!dataListSelect || dataListSelect.length === 0) {
            setResultsDisplay([]);
            setDataTong([]);
            return;
        }


        // Lấy giá trị schoolYearStart và schoolYearEnd từ state (lấy từ DB)
        let dau_nam = schoolYearStart ? new Date(schoolYearStart) : null;
        let cuoi_nam = schoolYearEnd ? new Date(schoolYearEnd) : null;
        let flat = false;

        dataListSelect.forEach((item) => {
            if (item.chucVu?.soMien === -1) {
                flat = true;
            };
        })

        const events = [];
        const GCGD = Number(currentUser.maNgachInfo.GCGD);

        let GCGD2 = 0;
        let schoolYearEndDate2;
        let dateStart2;
        let dateEnd2;
        let gValue2 = 0;


        if (dataListSelect2 && dataListSelect2.length > 0) {
            // Lấy schoolYearEnd từ state thay vì dataListSelect2[0]
            schoolYearEndDate2 = schoolYearEnd ? new Date(schoolYearEnd) : null;
            dateStart2 = new Date(dataListSelect2[0].startTime);
            const itemEndDate = dataListSelect2[0].endTime ? new Date(dataListSelect2[0].endTime) : schoolYearEndDate2;
            dateEnd2 = (itemEndDate > schoolYearEndDate2) ? schoolYearEndDate2 : itemEndDate;

            // Nếu là -1: Tính bằng số tuần * GCGD / 44
            if (dataListSelect2[0].chucVu?.soMien === -1) {
                const diffTime = Math.abs(dateEnd2 - dateStart2);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const weeks = diffDays / 7;
                gValue2 = (weeks * GCGD) / 44;
                GCGD2 = GCGD - gValue2;
            }
        }
        if (dataListSelect.length === 1 && dataListSelect[0].chucVu?.soMien === -1) return gValue2;

        // Tạo danh sách sự kiện từ dataListSelect
        dataListSelect.forEach((item) => {
            if (item.chucVu?.soMien === -1) return;
            if (item.startTime && item.chucVu?.soMien !== undefined) {
                // Lấy schoolYearEnd từ state thay vì dataListSelect[0]
                const schoolYearEndDate = schoolYearEnd ? new Date(schoolYearEnd) : null;
                const dateStart = new Date(item.startTime);
                const itemEndDate = item.endTime ? new Date(item.endTime) : schoolYearEndDate;
                const dateEnd = (itemEndDate > schoolYearEndDate) ? schoolYearEndDate : itemEndDate;

                const yearMonthStart = `${dateStart.getFullYear()}-${(dateStart.getMonth() + 1).toString().padStart(2, '0')}`;
                const yearMonthEnd = `${dateEnd.getFullYear()}-${(dateEnd.getMonth() + 1).toString().padStart(2, '0')}`;

                let gValue;

                if (item.chucVu.soMien < 1) {
                    // Nếu trong TH -1
                    if (dataListSelect2.length > 0) {
                        gValue = item.chucVu.soMien * GCGD2;
                    } else {
                        gValue = item.chucVu.soMien * GCGD;
                    }
                }
                else {
                    gValue = item.chucVu.soMien;
                }

                if (dau_nam && dateStart.getMonth() < dau_nam.getMonth() && dateStart.getFullYear() == dau_nam.getFullYear()) {
                    const yearMonthStart = `${dateStart.getFullYear()}-${(dau_nam.getMonth() + 1).toString().padStart(2, '0')}`;
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }
                else {
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }

                if (cuoi_nam && dateEnd.getMonth() > cuoi_nam.getMonth() && dateEnd.getFullYear() === cuoi_nam.getFullYear()) {
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


        // Cập nhật state với kết quả
        setResultsDisplay(results.map((r) => ({
            from: new Date(r.from).toLocaleDateString("vi-VN"),
            to: new Date(r.to).toLocaleDateString("vi-VN"),
            max: r.max,
        })));

        setDataTong(results)

        // Tính tổng max, làm tròn 2 chữ số
        let totalMax = results.reduce((sum, r) => sum + (Number(r.max) || 0), 0);
        totalMax = Math.round(totalMax * 100) / 100;
        return totalMax;
    };




    useEffect(() => {
        calculateTotals();
    }, [dataList]);

    const onReset = () => {
        reset(formSchema);
        setEditRecord(null);
    };

    const handleEdit = (record) => {
        setEditRecord({
            ...record,
            chucVu: record.chucVu?._id || record.chucVu,
            user: record.user?._id || record.user,
            startTime: record.startTime ? dayjs(record.startTime) : null,
            endTime: record.endTime ? dayjs(record.endTime) : null,
            schoolYearStart: record.schoolYearStart ? dayjs(record.schoolYearStart) : null,
            schoolYearEnd: record.schoolYearEnd ? dayjs(record.schoolYearEnd) : null,
        });
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
            width: '24%',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            sorter: (a, b) => a.chucVuCongViec.localeCompare(b.chucVuCongViec),
        },
        {
            title: 'Thời gian tính',
            dataIndex: 'thoiGianTinh',
            key: 'thoiGianTinh',
            width: '18%',
            render: (text) => <span className="text-gray-700">{text}</span>,
            sorter: (a, b) => a.thoiGianTinh.localeCompare(b.thoiGianTinh)
        },
        {
            title: 'Tỷ lệ % miễn giảm',
            dataIndex: 'tyLeMienGiam',
            key: 'tyLeMienGiam',
            align: 'center',
            width: '12%',
            render: (text) => <span>{text}</span>,
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
            align: 'center',
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc chắn muốn xóa?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    getPopupContainer={trigger => trigger.parentNode} // Thêm dòng này
                >
                    <Button danger size="small">Xóa</Button>
                </Popconfirm>
            ),
        },
    ];



    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize); // Thêm dòng này
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


    // Lấy schoolYearStart, schoolYearEnd từ Setting (chỉ hiển thị, không cho chọn)


    const fetchData5 = async () => {
        try {
            const res = await fetch(`/api/admin/user/user-select`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListUser(data);
                setLoading(false)
            } else {
                toast.error("Failed to fetch data user");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const fetchData6 = async () => {
        try {
            const res = await fetch(`/api/admin/select/kiem-nhiem`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListChucVu(data);
            } else {
                toast.error("Failed to fetch data chucVu");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    useEffect(() => {
        fetchData5();
        fetchData6();

        // Đã chuyển sang lấy từ Setting, không dùng localStorage nữa
    }, []);

    // Không cho phép thay đổi schoolYearStart, schoolYearEnd nữa
    // const handleSchoolYearEndChange = (date) => {...}
    // const handleSchoolYearStartChange = (date) => {...}

    const onSubmit = async (data) => {
        try {
            // Kiểm tra ngày bắt đầu/kết thúc năm học
            if (!schoolYearStart) {
                toast.error('Vui lòng chọn ngày bắt đầu năm học!');
                return;
            }

            if (!schoolYearEnd) {
                toast.error('Vui lòng chọn ngày kết thúc năm học!');
                return;
            }

            // Kiểm tra ngày bắt đầu
            if (!data.startTime) {
                toast.error('Vui lòng chọn ngày bắt đầu!');
                return;
            }

            // Thêm ngày bắt đầu/kết thúc năm học vào data
            const payload = {
                ...data,
                id: editRecord?._id,
                schoolYearStart,
                schoolYearEnd,
            };
            console.log(payload);
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/users/kiem-nhiem-user", {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success(editRecord ? "Chỉnh sửa thành công" : "Thêm mới thành công");
                fetchData2();
                onReset();
            } else {
                toast.error("Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        }
    };

    const onReset2 = () => {
        reset(formSchema);
        setEditRecord(null);
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col h-full">
            {/* Form bên trái */}
            <div className="p-3 px-5 shadow-lg bg-white rounded-xl border border-gray-100 flex-shrink-0 " style={{ width: '30%', maxHeight: 'calc(85vh - 90px)' }}>
                <div className="flex justify-between items-center mb-2">
                    <Title className="text-center m-0" level={4}>PHÂN CÔNG KIỆM NHIỆM</Title>
                    <Button
                        type="text"
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-red-500"
                    >
                        ✕
                    </Button>
                </div>
                <Divider className="my-1" />
                <div className="flex gap-4 text-small-bold">
                    <div className="w-1/2">
                        <div className="font-bold mb-1">Ngày bắt đầu năm học <span className="text-red-600">*</span></div>
                        <DatePicker
                            value={schoolYearStart}
                            disabled
                            placeholder="Chọn ngày bắt đầu năm học"
                            style={{ width: '100%' }}
                            className={!schoolYearStart ? 'border-red-300 hover:border-red-500' : ''}
                        />
                        {!schoolYearStart && <div className="text-red-500 text-sm mt-1">Trường này là bắt buộc</div>}
                    </div>
                    <div className="w-1/2">
                        <div className="font-bold mb-1">Ngày kết thúc năm học <span className="text-red-600">*</span></div>
                        <DatePicker
                            value={schoolYearEnd}
                            disabled
                            placeholder="Chọn ngày kết thúc năm học"
                            style={{ width: '100%' }}
                            className={!schoolYearEnd ? 'border-red-300 hover:border-red-500' : ''}
                        />
                        {!schoolYearEnd && <div className="text-red-500 text-sm mt-1">Trường này là bắt buộc</div>}
                    </div>
                </div>
                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 mt-3">
                    <Form.Item
                        label={<span className="font-bold text-xl">Công việc / Chức vụ <span className="text-red-600">*</span></span>}
                        validateStatus={errors.chucVu ? 'error' : ''}
                        help={errors.chucVu?.message}
                    >
                        <Controller
                            name="chucVu"
                            control={control}
                            rules={{ required: "Chức vụ, công việc là bắt buộc" }}
                            render={({ field }) => (
                                <Select
                                    className="input-select"
                                    placeholder="Chọn công việc, chức vụ ..."
                                    {...field}
                                    options={listChucVu.map(item => ({ label: item.tenCV, value: item._id }))}
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-bold text-xl">Người nhận nhiệm vụ <span className="text-red-600">*</span></span>}
                        validateStatus={errors.user ? 'error' : ''}
                        help={errors.user?.message}
                    >
                        <Controller
                            name="user"
                            control={control}
                            rules={{ required: "Bắt buộc" }}
                            render={({ field }) => (
                                <Select
                                    className="input-select"
                                    placeholder="Chọn người nhận nhiệm vụ ..."
                                    {...field}
                                    options={listUser.map(item => ({ label: item.username, value: item._id }))}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            )}
                        />
                    </Form.Item>

                    <div className="flex justify-between">
                        <Form.Item
                            label={<span className="font-bold text-xl">Ngày bắt đầu <span className="text-red-600">*</span></span>}
                            className="w-[40%]"
                            validateStatus={errors.startTime ? 'error' : ''}
                            help={errors.startTime?.message}
                        >
                            <Controller
                                name="startTime"
                                control={control}
                                rules={{ required: "Ngày bắt đầu là bắt buộc" }}
                                render={({ field }) => (
                                    <DatePicker {...field} placeholder="Chọn ngày bắt đầu" />
                                )}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xl">Ngày kết thúc </span>}
                            className="w-[40%]"
                            help={errors.endTime?.message}
                        >
                            <Controller
                                name="endTime"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker {...field} placeholder="Chọn ngày kết thúc" />
                                )}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span className="font-bold text-xl">Ghi chú <span className="text-red-600">*</span></span>}
                        validateStatus={errors.ghiChu ? 'error' : ''}
                        help={errors.ghiChu?.message}
                    >
                        <Controller
                            name="ghiChu"
                            control={control}
                            render={({ field }) => <TextArea className="input-text" placeholder="Nhập ghi chú..." {...field} />}
                        />
                    </Form.Item>

                    <div className="flex justify-center items-center mt-4">
                        <Space size="middle">
                            <Button
                                className="bg-blue-500 hover:bg-blue-700"
                                loading={isSubmitting}
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                            >
                                {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                            </Button>
                            <Button onClick={onReset2}>Hủy</Button>
                        </Space>
                    </div>
                </Form>
            </div>

            {/* Table + Kết quả bên phải */}
            <div className="flex flex-col px-3 py-2 shadow-lg bg-white rounded-xl border border-gray-100 min-w-0" style={{ width: '70%' }}>
                <div className="border-b border-blue-500 pb-2 mb-0">
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
                                    onChange: (page, size) => {
                                        setCurrent(page);
                                        setPageSize(size);
                                    },
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                                }}
                                onChange={handleTableChange}
                                className="custom-table"
                                bordered
                                size="middle"
                                scroll={{ x: 'max-content', y: 'calc(85vh - 380px)' }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={3} className="font-bold text-lg text-right">
                                            Tổng số tiết quy chuẩn:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell className="font-bold text-lg text-red-600">{finalResult || 0}</Table.Summary.Cell>
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
                        {loadings ? <Spin size="large" /> : (
                            <>
                                <TableKiemNhiem data={dataListSelect} handleEdit={handleEdit} />
                                {/* Kết quả dưới Table */}
                                {/* <div className="mt-4 bg-white rounded-lg p-2 shadow border border-gray-100 w-full max-w-md mx-auto">
                              <div className="border-b border-blue-500 pb-2 mb-2">
                                <h3 className="text-base font-semibold text-blue-600 text-center">Kết quả</h3>
                              </div>
                              <div className="overflow-auto max-h-48">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-50 text-small-bold">
                                      <th className="border border-gray-200 px-2 py-1 text-left">Từ</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left">Đến</th>
                                      <th className="border border-gray-200 px-3 py-1 text-center">Miễn giảm</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resultsDisplay.length > 0 ? (
                                      resultsDisplay.map((result, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                          <td className="border border-gray-200 px-2 py-1 text-green-600 font-medium">{result.from}</td>
                                          <td className="border border-gray-200 px-2 py-1 text-blue-600 font-medium">{result.to}</td>
                                          <td className="border border-gray-200 px-3 py-1 text-center text-red-600 font-medium">{result.max}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="text-center text-gray-400 py-2">Không có dữ liệu miễn giảm</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div> */}
                            </>
                        )}
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default DutyExemptionForm;

