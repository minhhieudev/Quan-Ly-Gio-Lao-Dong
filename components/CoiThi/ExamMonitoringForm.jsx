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
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
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
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newHocPhan, setNewHocPhan] = useState("");

    const [currentHocPhan, setCurrentHocPhan] = useState(null);

    const soTietQC = watch("soTietQuyChuan");
    const ngayThi = watch("ngayThi");
    const thoiGian = watch("thoiGianThi");

    useEffect(() => {
        let timeValue = thoiGian
        let gioChuan;
        if (currentHocPhan?.time && Array.isArray(currentHocPhan?.time) && currentHocPhan?.time.length > 0) {
            timeValue = currentHocPhan?.time.length > 1
                ? Math.max(...currentHocPhan?.time)
                : currentHocPhan?.time[0];
        }
        // ) Coi thi ngoài giờ hành chính (sau 17 giờ 00,  thứ Bảy, Chủ Nhật) hoặc coi thi ngoài trường: 01 giờ chuẩn được nhân hệ số 1,2.

        if (timeValue == 60) {
            gioChuan = 1;
        } else if (timeValue == 90) {
            gioChuan = 1.25;
        } else if (timeValue == 120) {
            gioChuan = 1.5;
        } else if (timeValue == 150) {
            gioChuan = 1.75;
        }

        // Kiểm tra nếu ngày thi rơi vào Thứ Bảy hoặc Chủ Nhật
        const ngayThiMoment = moment(ngayThi, "YYYY-MM-DD"); // Đảm bảo `ngayThi` đang ở định dạng YYYY-MM-DD
        const dayOfWeek = ngayThiMoment.day();

        if (dayOfWeek === 6 || dayOfWeek === 0) { // 6 là Thứ Bảy, 0 là Chủ Nhật
            gioChuan *= 1.2; // Nhân hệ số 1,2 nếu rơi vào ngoài giờ hành chính
        }

        console.log("2:", timeValue);
        setValue("soTietQuyChuan", gioChuan); // Cập nhật giá trị số tiết quy chuẩn vào form
    }, [ngayThi, currentHocPhan, thoiGian]);



    const handleAddNewClick = () => {
        setIsAddingNew(!isAddingNew);
    };

    const handleSaveNewHocPhan = () => {
        const newHocPhanObj = {
            _id: Math.random().toString(36).substr(2, 9),
            hocPhan: newHocPhan,
            ky: '',
            time: "",
            ngayThi: '',
        };

        // Cập nhật listSelect với học phần mới
        setListSelect([...listSelect, newHocPhanObj]);

        // Reset trạng thái thêm mới và input học phần
        setIsAddingNew(false);
        setNewHocPhan("");
    };

    const convertDateFormat = (dateString) => {
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    };

    const handleSelectChange = (setCurrentHocPhan) => {
        const selectedHocPhan = listSelect.find(item => item.hocPhan.join(', ') == setCurrentHocPhan);

        if (selectedHocPhan) {
            setValue("ngayThi", convertDateFormat(selectedHocPhan.ngayThi)); // Lấy giá trị từ selectedHocPhan
            setValue("ky", selectedHocPhan.ky || '');
            setValue("thoiGianThi", selectedHocPhan.time.join(',') || ''); // Đảm bảo bạn có trường này
            setValue("ghiChu", selectedHocPhan.ghiChu); // Đảm bảo bạn có trường này
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

                const res = await fetch(`/api/giaovu/pc-coi-thi/get-for-gv/?namHoc=${namHoc}&ky=${ky}&gvGiangDay=${currentUser.username}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });


                if (res.ok) {
                    const data = await res.json();
                    setListSelect(data);
                    console.log('Data:', data)
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
        console.log('data:', data)
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/work-hours/CongTacCoiThi", {
                method,
                body: JSON.stringify({ ...data, type: type, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
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
            key: 'soTietQuyChuan',
            render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text}</span>,

        },
        {
            title: 'Học phần',
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            render: (text) => <span style={{ fontWeight: 'bold', color: 'green' }}>{text}</span>,
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
        <div className="flex gap-2 max-sm:flex-col h-full">
            <div className="p-5 shadow-xl bg-white rounded-xl flex-[25%]">
                <Title className="text-center" level={4}>CÔNG TÁC COI THI</Title>

                <Form onFinish={handleSubmit(onSubmit)} layout="vertical" >
                    <Space direction="vertical" className="w-full" size={0}>
                        <div className="flex justify-between items-center w-full">
                            {!isAddingNew && (
                                <Form.Item
                                    label={
                                        <span className="font-bold text-xl">
                                            Học phần coi thi <span className="text-red-600">*</span>
                                        </span>
                                    }
                                    className="w-full"
                                    validateStatus={errors.hocPhan ? 'error' : ''}
                                    help={errors.hocPhan?.message}
                                >
                                    <Space className="flex ">
                                        <div className="w-[200px]">
                                            <Controller

                                                name="hocPhan"
                                                control={control}
                                                rules={{ required: "Học phần là bắt buộc" }}
                                                render={({ field }) => (
                                                    <Select
                                                        showSearch
                                                        allowClear
                                                        placeholder="Nhập hoặc chọn tên học phần..."
                                                        {...field}
                                                        options={listSelect.map((item, index) => ({
                                                            value: item.hocPhan.join(', '),
                                                            label: item.hocPhan.join(', '),
                                                            key: `${item.hocPhan[0]}-${index}` // key duy nhất
                                                        }))}

                                                        filterOption={(input, option) =>
                                                            option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                        }
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            handleSelectChange(value);
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>

                                    </Space>
                                </Form.Item>
                            )}
                            {isAddingNew && (
                                <Form.Item
                                    label={<span className="font-bold text-xl">Thêm học phần mới</span>}
                                    className="w-full"
                                >
                                    <Space className="w-full">
                                        <Input
                                            value={newHocPhan}
                                            onChange={(e) => setNewHocPhan(e.target.value)}
                                            placeholder="Nhập tên học phần mới..."
                                            className="w-[90%]"
                                        />
                                        <Button type="primary" onClick={handleSaveNewHocPhan}>
                                            Lưu
                                        </Button>
                                    </Space>
                                </Form.Item>
                            )}
                            <Form.Item
                                label={<span className="font-bold text-xl">Thêm</span>}
                                className="w-full flex-1"
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={handleAddNewClick}
                                />
                            </Form.Item>

                        </div>
                        {/* <Form.Item
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
                        </Form.Item> */}

                        <div className="flex justify-between">
                            <Form.Item
                                label={<span className="font-bold text-xl">Thời gian thi (Phút)</span>}
                            >
                                <Controller
                                    name="thoiGianThi"
                                    control={control}
                                    render={({ field }) =>
                                        <Select
                                            placeholder="Thời gian thi..."
                                            allowClear
                                            className="w-[20%]"
                                            {...field}
                                            onChange={(value) => {
                                                field.onChange(value); // Cập nhật giá trị trong form
                                            }}
                                        >
                                            <Option value="45">45</Option>
                                            <Option value="60">60</Option>
                                            <Option value="90">90</Option>
                                            <Option value="120">120</Option>
                                            <Option value="180">180</Option>
                                        </Select>
                                    }
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

                        <div className="flex  justify-between text-center">
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
                            <div >
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
