"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Select, Modal, Table, Popconfirm, Spin, Pagination } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import * as XLSX from 'xlsx';
import { SearchOutlined } from '@ant-design/icons'
import { FileExcelOutlined } from '@ant-design/icons';
import { exportGiangVien } from "@lib/fileExport";

const { Title } = Typography;
const { Option } = Select;

const formSchema = {
    username: "",
    email: "",
    maKhoa: "",
    role: "",
    donViQuanLy: '',
    maNgach: '',
    hocHamHocVi: '',
    maGV: ''
};

const UserForm = () => {
    const [dataList, setDataList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });
    const [searchName, setSearchName] = useState("");
    const [selectedKhoa, setSelectedKhoa] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(true);

    const [khoaOptions, setKhoaOptions] = useState([]);
    const [ngachOptions, setNgachOptions] = useState([]);
    const quyenOptions = [
        { label: "Giảng viên", value: "user" },
        { label: "Khoa", value: "khoa" },
        { label: "Admin", value: "admin" }
    ];

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [current, setCurrent] = useState(1);

    // Phân trang dữ liệu
    const paginatedData = filteredList.slice(
        (current - 1) * pageSize,
        current * pageSize
    );

    useEffect(() => {
        fetchData();
        getListKhoa();
        getListNgach();
    }, []);

    useEffect(() => {
        let filteredData = dataList;
        if (searchName) {
            filteredData = filteredData.filter(user => user.username.toLowerCase().includes(searchName.toLowerCase()));
        }
        if (selectedKhoa && selectedKhoa != null) {
            filteredData = filteredData.filter(user => user.maKhoa === selectedKhoa);
        }
        if (selectedRole && selectedRole != null) {
            filteredData = filteredData.filter(user => user.role === selectedRole);
        }
        // Ẩn tài khoản admin gốc (ví dụ: username === 'admin' hoặc email === 'admin@...')
        filteredData = filteredData.filter(user => !(user.role === 'admin' && (user.username === 'admin' || user.email?.toLowerCase().includes('admin'))));
        setFilteredList(filteredData);
    }, [searchName, selectedKhoa, selectedRole, dataList]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/user`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataList(data);
                setFilteredList(data);
                setLoading(false)
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const getListKhoa = async () => {
        try {
            const res = await fetch(`/api/admin/khoa`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                // Chỉ lấy thuộc tính 'tenKhoa' từ dữ liệu
                //const tenKhoaList = data.map(khoa => khoa.tenKhoa);
                setKhoaOptions(data);
            } else {
                toast.error("Failed to get khoa");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data khoa");
        }
    };
    const getListNgach = async () => {
        try {
            const res = await fetch(`/api/admin/ma-ngach`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();

                setNgachOptions(data);
            } else {
                toast.error("Failed to get Ngach");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data Ngach");
        }
    };


    // Gọi lại API sau khi thêm mới hoặc chỉnh sửa thành công
    const onSubmit = async (data) => {
        try {
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/admin/user", {
                method,
                body: JSON.stringify({ ...data, id: editRecord?._id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success(editRecord ? "Chỉnh sửa thành công" : "Thêm mới thành công");
                fetchData();  // Gọi lại API để cập nhật danh sách sau khi thành công
                onReset();    // Reset form
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
        setShowForm(!showForm)
        setEditRecord(record);
        // Sử dụng setValue để đổ dữ liệu vào form
        setValue("username", record.username);
        setValue("email", record.email);
        setValue("maKhoa", record.maKhoa);
        setValue("role", record.role);

        setValue("maNgach", record.maNgach);
        setValue("hocHamHocVi", record.hocHamHocVi);

        setValue("donViQuanLy", record.donViQuanLy);
        setValue("maGV", record.maGV);

    };


    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/admin/user", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Đã xóa user !");
                setDataList(prevData => prevData.filter(item => item._id !== id));
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const createManyUser = async (ListDataUser) => {
        setIsUploading(true);
        try {
            const method = "POST";
            const res = await fetch("/api/admin/user/create", {
                method,
                body: JSON.stringify({ users: ListDataUser }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const newData = await res.json();
                fetchData();
                toast.success("Thêm mới thành công");
                onReset();
                fileInputRef.current.value = "";
            } else {
                toast.error("Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        } finally {
            setIsUploading(false); // Ẩn hiệu ứng xoay khi hoàn thành
        }
    };


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const ListDataUser = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            ListDataUser.shift(); // Loại bỏ dòng tiêu đề nếu cần

            if (ListDataUser.length > 0) {
                createManyUser(ListDataUser); // Gọi hàm gửi dữ liệu lên server
            } else {
                toast.error("No user data found in file.");
            }

        };

        reader.onerror = () => {
            toast.error("Đã xảy ra lỗi khi đọc file Excel");
        };

        reader.readAsBinaryString(file);
    };


    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, index) => index + 1,
            width: 20,
        },
        {
            title: 'Mã GV',
            dataIndex: 'maGV',
            key: 'maGV'
        },
        {
            title: 'Họ tên giảng viên',
            dataIndex: 'username',
            key: 'username',
            className: 'text-blue-500 font-bold'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },

        {
            title: 'Mã ngạch',
            dataIndex: 'maNgach',
            key: 'maNgach',
            className: 'text-green-500 font-bold ',

        },
        // {
        //     title: 'GCPVCD',
        //     dataIndex: 'GCPVCD',
        //     key: 'GCPVCD',


        // },
        {
            title: 'Học hàm/Học vị',
            dataIndex: 'hocHamHocVi',
            key: 'hocHamHocVi'
        },
        // {
        //     title: 'Định mức GC',
        //     dataIndex: 'dinhMucGioChuan',
        //     key: 'dinhMucGioChuan',
        //     className: 'text-red-700 font-bold',
        //     width: 120,


        // },
        {
            title: 'Khoa',
            dataIndex: 'khoa',
            key: 'khoa'
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
            width: 20,

        },
    ];

    return loading ? (
        <Loader />
    ) : (
        <div className=" mt-1 h-[92vh]">
            {showForm && (
                <Modal
                    title={editRecord ? "CHỈNH SỬA NGƯỜI DÙNG" : "THÊM MỚI NGƯỜI DÙNG"}
                    visible={showForm}
                    onCancel={() => {
                        setShowForm(false);
                        setEditRecord(null);
                        reset(formSchema);
                    }}
                    footer={null}
                    width={'900px'}
                    height={'600px'}
                >
                    <div className="p-2 shadow-xl bg-white rounded-xl ">
                        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-5 mt-6">
                            <Space direction="vertical" className="w-full">

                                <div className="flex justify-between gap-2">

                                    <div className="w-[25%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Mã GV: <span className="text-red-600 ">*</span></span>}
                                            validateStatus={errors.maGV ? 'error' : ''}
                                            help={errors.maGV?.message}
                                        >
                                            <Controller
                                                name="maGV"
                                                control={control}
                                                rules={{ required: "Mã GV là bắt buộc" }}
                                                render={({ field }) => <Input className="input-text" placeholder="Nhập mã GV ..." {...field} />}
                                            />
                                        </Form.Item>
                                    </div>

                                    <div className="w-[55%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Họ tên giảng viên <span className="text-red-600">*</span></span>}
                                            className=" p-0"
                                            validateStatus={errors.username ? 'error' : ''}
                                            help={errors.username?.message}
                                        >
                                            <Controller
                                                name="username"
                                                control={control}
                                                rules={{ required: "Họ tên giảng viên là bắt buộc" }}
                                                render={({ field }) => <Input className="input-text" placeholder="Nhập tên giảng viên ..." {...field} />}
                                            />
                                        </Form.Item>
                                    </div>



                                </div>
                                <div className="flex justify-between gap-2">


                                    <Form.Item
                                        label={<span className="font-bold text-xl">Email <span className="text-red-600">*</span></span>}
                                        className="w-[40%]"
                                        validateStatus={errors.email ? 'error' : ''}
                                        help={errors.email?.message}
                                    >
                                        <Controller
                                            name="email"
                                            control={control}
                                            rules={{ required: "Email là bắt buộc" }}
                                            render={({ field }) => <Input className="input-text" placeholder="Nhập email ..." {...field} />}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className="font-bold text-xl">Mã ngạch <span className="text-red-600">*</span></span>}
                                        className="w-[40%] p-0"
                                        validateStatus={errors.maNgach ? 'error' : ''}
                                        help={errors.maNgach?.message}
                                    >
                                        <Controller
                                            name="maNgach"
                                            control={control}
                                            rules={{ required: "Mã ngạch là bắt buộc" }}
                                            render={({ field }) => (
                                                <Select className="w-full" placeholder="Chọn mã ngạch" {...field}>
                                                    {ngachOptions.map((khoa, index) => (
                                                        <Option key={index} value={khoa.maNgach}>
                                                            {khoa.tenNgach}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </Form.Item>


                                </div>

                                <div className="flex justify-between gap-2">

                                    <div className="w-[55%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Khoa <span className="text-red-600 ">*</span></span>}
                                            validateStatus={errors.maKhoa ? 'error' : ''}
                                            help={errors.maKhoa?.message}
                                        >
                                            <Controller
                                                name="maKhoa"
                                                control={control}
                                                rules={{ required: "Khoa là bắt buộc" }}
                                                render={({ field }) => (
                                                    <Select className="w-full" placeholder="Chọn khoa" {...field}>
                                                        {khoaOptions.map((khoa, index) => (
                                                            <Option key={index} value={khoa.maKhoa}>
                                                                {khoa.tenKhoa}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </Form.Item>
                                    </div>

                                    <div className="w-[35%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Học hàm, học vị </span>}

                                        >
                                            <Controller
                                                name="hocHamHocVi"
                                                control={control}
                                                render={({ field }) => <Input className="input-text" placeholder="Nhập học hàm, học vị ..." {...field} />}
                                            />
                                        </Form.Item>
                                    </div>



                                </div>

                                <div className="flex justify-between">

                                    <div className="w-[45%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Đơn vị quản lý </span>}
                                            className="p-0"
                                            validateStatus={errors.donViQuanLy ? 'error' : ''}
                                            help={errors.donViQuanLy?.message}
                                        >
                                            <Controller
                                                name="donViQuanLy"
                                                control={control}
                                                render={({ field }) => <Input className="input-text" placeholder="Nhập đơn vị quản lý ..." {...field} />}
                                            />
                                        </Form.Item>
                                    </div>

                                    <div className="w-[35%]">
                                        <Form.Item
                                            label={<span className="font-bold text-xl">Quyền <span className="text-red-600 ">*</span></span>}
                                        >
                                            <Controller
                                                name="role"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select className="w-full" placeholder="Chọn quyền" {...field}>
                                                        {quyenOptions.map(role => (
                                                            <Option key={role.value} value={role.value}>
                                                                {role.label}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button className="bg-blue-500 hover:bg-blue-700" loading={isSubmitting} type="primary" htmlType="submit">
                                        {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                                    </Button>
                                    <Button danger className="ml-4" htmlType="button" onClick={onReset}>
                                        Reset
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <Spin spinning={isUploading}>
                                        <label htmlFor="excelUpload">
                                            <Button
                                                className="mt-3 button-lien-thong-vlvh"
                                                type="primary"
                                                icon={<UploadOutlined />}
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? 'Đang tải lên...' : 'Import từ file Excel'}
                                            </Button>
                                        </label>
                                    </Spin>

                                    <div className="hidden">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="excelUpload"
                                            ref={fileInputRef}
                                        />
                                    </div>
                                </div>

                            </Space>
                        </Form>
                    </div>
                </Modal>
            )}
            <div className="p-2 shadow-xl bg-white rounded-xl ">
                <div className="flex flex-col gap-0 justify-between items-center mb-0">
                    <Title level={4} className="text-center text-[18px]">DANH SÁCH NGƯỜI DÙNG</Title>
                    <div className="flex gap-3 justify-between w-full mb-2">
                        <div className="flex-1">
                            <Input size="small"
                                className=" w-[70%] flex-1"
                                placeholder="Tìm kiếm theo tên giảng viên"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </div>

                        <div className="flex flex-1 gap-1">
                            <div className="text-base-bold">Khoa:</div>
                            <Select size="small"
                                className="w-[40%]"
                                placeholder="Lọc theo khoa"
                                allowClear
                                value={selectedKhoa}
                                onChange={value => setSelectedKhoa(value)}
                            >
                                {khoaOptions.map(khoa => (
                                    <Option key={khoa.maKhoa} value={khoa.maKhoa}>
                                        {khoa.tenKhoa}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex flex-1 gap-1">
                            <div className="text-base-bold">Quyền:</div>
                            <Select size="small"
                                className="w-[30%]"
                                placeholder="Lọc theo quyền"
                                allowClear
                                value={selectedRole}
                                onChange={value => setSelectedRole(value)}
                            >
                                {quyenOptions.map(role => (
                                    <Option key={role.value} value={role.value}>
                                        {role.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div >
                            <Button
                                type="primary"
                                onClick={() => {
                                    setEditRecord(null);
                                    reset(formSchema);
                                    setShowForm(true);
                                }}
                                className="primary"
                            >
                                {showForm ? 'Đóng' : 'Tạo mới'}
                            </Button>
                        </div>


                    </div>
                </div>

                <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                    <Table
                        columns={columns}
                        dataSource={paginatedData}
                        rowKey="_id"
                        pagination={false} // Tắt phân trang trên Table

                    />
                </div>

                <div className="mt-2 flex justify-between">
                    <Button
                        className="button-lien-thong-vlvh text-white font-bold shadow-md "
                        onClick={() => exportGiangVien(paginatedData, selectedKhoa)}
                    ><FileExcelOutlined />
                        Xuất file Excel
                    </Button>
                    <Pagination
                        current={current}
                        pageSize={pageSize}
                        total={filteredList.length}
                        onChange={(page, size) => {
                            setCurrent(page);
                            setPageSize(size);
                        }}
                        pageSizeOptions={['10', '25', '50', '100', '200']}
                        showSizeChanger
                        className="flex justify-end"
                    />
                </div>
            </div>
        </div>
    );
};

export default UserForm;
