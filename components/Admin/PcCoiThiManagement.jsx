"use client";

import { useState, useEffect } from "react";
import { FileExcelOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { exportPcCoiThi } from "@lib/fileExport";
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
import {  SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { getAcademicYearConfig } from '@lib/academicYearUtils';

const { Option } = Select;

const PcCoiThiManagement = () => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Filters
    const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
    const [namHoc, setNamHoc] = useState(defaultNamHoc);
    const [ky, setKy] = useState('');
    const [type, setType] = useState('Coi thi');
    const [loaiKyThi, setLoaiKyThi] = useState('');
    const [loai, setLoai] = useState('chinh-quy');

    // Inline editing
    const [editingKey, setEditingKey] = useState('');
    const [editForm] = Form.useForm();

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                namHoc,
                ky,
                type: loai, // Sử dụng loai thay vì type
                loaiKyThi
            });
            const res = await fetch(`/api/pc-coi-thi?${params}`);
            if (res.ok) {
                const data = await res.json();
                setDataList(data);
            } else {
                message.error('Lỗi khi tải dữ liệu');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [namHoc, ky, loai, loaiKyThi]);

    // Handle create/update
    const handleSubmit = async (values) => {
        try {
            // Convert comma-separated strings to arrays
            const formattedValues = {
                ...values,
                hocPhan: values.hocPhan && values.hocPhan.trim() ?
                    values.hocPhan.split(',').map(s => s.trim()).filter(s => s) : [],
                lop: values.lop && values.lop.trim() ?
                    values.lop.split(',').map(s => s.trim()).filter(s => s) : [],
                phong: values.phong && values.phong.trim() ?
                    values.phong.split(',').map(s => s.trim()).filter(s => s) : [],
                cbo1: values.cbo1 && values.cbo1.trim() ?
                    values.cbo1.split(',').map(s => s.trim()).filter(s => s) : [],
                cbo2: values.cbo2 && values.cbo2.trim() ?
                    values.cbo2.split(',').map(s => s.trim()).filter(s => s) : [],
                hinhThuc: values.hinhThuc && values.hinhThuc.trim() ?
                    values.hinhThuc.split(',').map(s => s.trim()).filter(s => s) : [],
                thoiGian: values.thoiGian && values.thoiGian.trim() ?
                    values.thoiGian.split(',').map(s => s.trim()).filter(s => s) : [],
                // Thêm các trường từ filters
                namHoc,
                ky,
                type: loai, // Sử dụng loai thay vì type
                loaiKyThi: values.loaiKyThi || loaiKyThi,
            };

            const url = '/api/pc-coi-thi';
            const method = editingRecord ? 'PUT' : 'POST';
            const body = editingRecord
                ? { ...formattedValues, id: editingRecord._id }
                : formattedValues;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                message.success(editingRecord ? 'Cập nhật thành công' : 'Tạo mới thành công');
                setModalVisible(false);
                form.resetFields();
                setEditingRecord(null);
                fetchData();
            } else {
                const errorText = await res.text();
                message.error('Lỗi: ' + errorText);
            }
        } catch (error) {
            console.error('Error submitting:', error);
            message.error('Lỗi khi lưu dữ liệu');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            const res = await fetch('/api/pc-coi-thi', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                message.success('Xóa thành công');
                fetchData();
            } else {
                const errorText = await res.text();
                message.error('Lỗi: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting:', error);
            message.error('Lỗi khi xóa dữ liệu');
        }
    };



    // Handle create new
    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Inline editing functions
    const isEditing = (record) => record._id === editingKey;

    const editInline = (record) => {
        editForm.setFieldsValue({
            ...record,
            hocPhan: Array.isArray(record.hocPhan) && record.hocPhan.length > 0 ? record.hocPhan.join(', ') : '',
            lop: Array.isArray(record.lop) && record.lop.length > 0 ? record.lop.join(', ') : '',
            phong: Array.isArray(record.phong) && record.phong.length > 0 ? record.phong.join(', ') : '',
            cbo1: Array.isArray(record.cbo1) && record.cbo1.length > 0 ? record.cbo1.join(', ') : '',
            cbo2: Array.isArray(record.cbo2) && record.cbo2.length > 0 ? record.cbo2.join(', ') : '',
            hinhThuc: Array.isArray(record.hinhThuc) && record.hinhThuc.length > 0 ? record.hinhThuc.join(', ') : '',
            thoiGian: Array.isArray(record.thoiGian) && record.thoiGian.length > 0 ? record.thoiGian.join(', ') : '',
        });
        setEditingKey(record._id);
    };

    const cancelInline = () => {
        setEditingKey('');
        editForm.resetFields();
    };

    const saveInline = async (id) => {
        try {
            const values = await editForm.validateFields();

            // Convert comma-separated strings back to arrays
            const formattedValues = {
                ...values,
                hocPhan: values.hocPhan && values.hocPhan.trim() ?
                    values.hocPhan.split(',').map(s => s.trim()).filter(s => s) : [],
                lop: values.lop && values.lop.trim() ?
                    values.lop.split(',').map(s => s.trim()).filter(s => s) : [],
                phong: values.phong && values.phong.trim() ?
                    values.phong.split(',').map(s => s.trim()).filter(s => s) : [],
                cbo1: values.cbo1 && values.cbo1.trim() ?
                    values.cbo1.split(',').map(s => s.trim()).filter(s => s) : [],
                cbo2: values.cbo2 && values.cbo2.trim() ?
                    values.cbo2.split(',').map(s => s.trim()).filter(s => s) : [],
                hinhThuc: values.hinhThuc && values.hinhThuc.trim() ?
                    values.hinhThuc.split(',').map(s => s.trim()).filter(s => s) : [],
                thoiGian: values.thoiGian && values.thoiGian.trim() ?
                    values.thoiGian.split(',').map(s => s.trim()).filter(s => s) : [],
                namHoc,
                ky,
                type: loai, // Sử dụng loai thay vì type
                loaiKyThi
            };

            const res = await fetch('/api/pc-coi-thi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formattedValues, id }),
            });

            if (res.ok) {
                message.success('Cập nhật thành công');
                setEditingKey('');
                fetchData();
            } else {
                const errorText = await res.text();
                message.error('Lỗi: ' + errorText);
            }
        } catch (error) {
            console.error('Error saving inline:', error);
            message.error('Lỗi khi lưu dữ liệu');
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            render: (_, __, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
        },
        {
            title: 'Mã học phần',
            dataIndex: 'maHocPhan',
            key: 'maHocPhan',
            width: 120,
        },
        {
            title: 'Học phần',
            dataIndex: 'hocPhan',
            key: 'hocPhan',
            width: 200,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="hocPhan"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: 'Vui lòng nhập học phần' }]}
                    >
                        <Input size="small" />
                    </Form.Item>
                ) : (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>
                        {Array.isArray(text) ? text.join(', ') : text}
                    </span>
                );
            },
        },
        {
            title: 'Nhóm/Lớp',
            dataIndex: 'lop',
            key: 'lop',
            width: 150,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="lop"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(', ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'Ngày thi',
            dataIndex: 'ngayThi',
            key: 'ngayThi',
            width: 120,
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: 'Ca',
            dataIndex: 'ca',
            key: 'ca',
            width: 80,
            render: (text) => <span style={{ fontWeight: "bold", color: "orange" }}>{text == '1' ? 'Sáng' : 'Chiều'}</span>,
        },
        {
            title: 'Phòng thi',
            dataIndex: 'phong',
            key: 'phong',
            width: 120,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="phong"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ fontWeight: "bold" }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(', ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'Cán bộ 1',
            dataIndex: 'cbo1',
            key: 'cbo1',
            width: 150,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="cbo1"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ fontWeight: 'bold', color: 'blue' }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(' - ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'Cán bộ 2',
            dataIndex: 'cbo2',
            key: 'cbo2',
            width: 150,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="cbo2"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ fontWeight: 'bold', color: 'blue' }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(' - ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'HT',
            dataIndex: 'hinhThuc',
            key: 'hinhThuc',
            width: 100,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="hinhThuc"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ fontWeight: 'bold' }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(', ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'TG',
            dataIndex: 'thoiGian',
            key: 'thoiGian',
            width: 100,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="thoiGian"
                        style={{ margin: 0 }}
                    >
                        <Input size="small" placeholder="Ngăn cách bằng dấu phẩy" />
                    </Form.Item>
                ) : (
                    <span style={{ fontWeight: 'bold' }}>
                        {Array.isArray(text) && text.length > 0 ? text.join(', ') : ''}
                    </span>
                );
            },
        },
        {
            title: 'Đợt',
            dataIndex: 'loaiKyThi',
            key: 'loaiKyThi',
            width: 60,
            render: (text) => (
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                    Đợt {text || '1'}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button
                            onClick={() => saveInline(record._id)}
                            type="primary"
                            size="small"
                        >
                            Lưu
                        </Button>
                        <Button
                            onClick={cancelInline}
                            size="small"
                        >
                            Hủy
                        </Button>
                    </Space>
                ) : (
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => editInline(record)}
                            size="small"
                            disabled={editingKey !== ''}
                        >
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={editingKey !== ''}
                            >
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className=" py-2">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">Quản lý Phân công Coi thi</h2>
                <div className="flex gap-2">
                    <Button
                        className="button-lien-thong-vlvh text-white font-bold shadow-md"
                        onClick={() => exportPcCoiThi(dataList, ky, namHoc, loaiKyThi)}
                        icon={<FileExcelOutlined />}
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div>
                    <label className="block text-sm font-medium mb-1">Loại:</label>
                    <Select
                        value={loai}
                        onChange={setLoai}
                        className="w-full"
                        placeholder="Chọn loại hình đào tạo"
                        allowClear
                    >
                        <Option value="chinh-quy">Chính quy</Option>
                        <Option value="lien-thong-vlvh">Liên thông vlvh</Option>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Năm học:</label>
                    <Select
                        value={namHoc}
                        onChange={setNamHoc}
                        className="w-full"
                        placeholder="Chọn năm học"
                    >
                        {namHocOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Kỳ :</label>
                    <Select
                        value={ky}
                        onChange={setKy}
                        className="w-full"
                        placeholder="Chọn kỳ"
                    >
                        <Option value="1">1</Option>
                        <Option value="2">2</Option>
                        <Option value="3">3</Option>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Loại kỳ thi:</label>
                    <Select
                        value={loaiKyThi}
                        onChange={setLoaiKyThi}
                        className="w-full"
                        placeholder="Chọn đợt thi"
                        allowClear
                    >
                        <Option value="1">Đợt 1</Option>
                        <Option value="2">Đợt 2</Option>
                        <Option value="3">Đợt 3</Option>
                        <Option value="4">Đợt 4</Option>
                        <Option value="5">Đợt 5</Option>
                        <Option value="6">Đợt 6</Option>
                        <Option value="7">Đợt 7</Option>
                    </Select>
                </div>
            </div>

            <Form form={editForm} component={false}>
                <Table
                    columns={columns}
                    dataSource={dataList}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1500, y: 600 }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                    }}
                />
            </Form>

            <Modal
                title={editingRecord ? 'Sửa phân công coi thi' : 'Thêm phân công coi thi'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="maHocPhan"
                            label="Mã học phần"
                        >
                            <Input placeholder="Nhập mã học phần" />
                        </Form.Item>

                        <Form.Item
                            name="hocPhan"
                            label="Học phần"
                            rules={[{ required: true, message: 'Vui lòng nhập học phần' }]}
                        >
                            <Input placeholder="Nhập tên học phần (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="lop"
                            label="Nhóm/Lớp"
                        >
                            <Input placeholder="Nhập nhóm/lớp (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="ngayThi"
                            label="Ngày thi"
                            rules={[{ required: true, message: 'Vui lòng nhập ngày thi' }]}
                        >
                            <Input placeholder="YYYY-MM-DD" />
                        </Form.Item>

                        <Form.Item
                            name="ca"
                            label="Ca"
                            initialValue="1"
                        >
                            <Select>
                                <Option value="1">Sáng</Option>
                                <Option value="2">Chiều</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="phong"
                            label="Phòng thi"
                        >
                            <Input placeholder="Nhập phòng thi (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="cbo1"
                            label="Cán bộ 1"
                        >
                            <Input placeholder="Nhập cán bộ 1 (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="cbo2"
                            label="Cán bộ 2"
                        >
                            <Input placeholder="Nhập cán bộ 2 (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="hinhThuc"
                            label="Hình thức (HT)"
                        >
                            <Input placeholder="Nhập hình thức (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>

                        <Form.Item
                            name="thoiGian"
                            label="Thời gian (TG)"
                        >
                            <Input placeholder="Nhập thời gian (ngăn cách bằng dấu phẩy nếu nhiều)" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Form.Item
                            name="loaiKyThi"
                            label="Loại kỳ thi"
                            initialValue={loaiKyThi}
                        >
                            <Select>
                                <Option value="1">Đợt 1</Option>
                                <Option value="2">Đợt 2</Option>
                                <Option value="3">Đợt 3</Option>
                                <Option value="4">Đợt 4</Option>
                                <Option value="5">Đợt 5</Option>
                                <Option value="6">Đợt 6</Option>
                                <Option value="7">Đợt 7</Option>
                            </Select>
                        </Form.Item>

                        <div className="text-sm text-gray-600 pt-6">
                            <p><strong>Năm học:</strong> {namHoc}</p>
                            <p><strong>Kỳ:</strong> {ky}</p>
                            <p><strong>Loại hình đào tạo:</strong> {loai}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setModalVisible(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingRecord ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PcCoiThiManagement;
