"use client";

import { useState, useEffect } from "react";
import { Button, Input, Form, Space, Typography, Table, Popconfirm, Spin, Pagination, Modal, Card, DatePicker, Alert, Tag } from "antd";
import toast from "react-hot-toast";
import { SearchOutlined, DeleteOutlined, FileExcelOutlined, ExclamationCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportPCKiemNhiem } from "@lib/fileExport";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const KiemNhiemBackupPage = () => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Fetch data function
    const fetchData = async () => {
        try {
            setLoading(true);
            let url = `/api/admin/kiem-nhiem-backup?page=${current}&pageSize=${pageSize}`;
            
            // Add date range filters if selected
            if (dateRange && dateRange[0] && dateRange[1]) {
                url += `&startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`;
            }
            
            const res = await fetch(url);
            if (res.ok) {
                const { data, total } = await res.json();
                setDataList(data);
                setTotal(total);
            } else {
                toast.error("Không thể tải dữ liệu lưu trữ kiêm nhiệm");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Lỗi khi tải dữ liệu lưu trữ kiêm nhiệm");
        } finally {
            setLoading(false);
        }
    };

    // Load data on initial render and when pagination or filters change
    useEffect(() => {
        fetchData();
    }, [current, pageSize, dateRange]);

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        setCurrent(1); // Reset to first page when filter changes
    };

    // Handle delete single record
    const handleDeleteRecord = async (id) => {
        try {
            const res = await fetch(`/api/admin/kiem-nhiem-backup`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                toast.success("Xóa bản ghi thành công");
                fetchData();
            } else {
                toast.error("Không thể xóa bản ghi");
            }
        } catch (err) {
            console.error("Error deleting record:", err);
            toast.error("Lỗi khi xóa bản ghi");
        }
    };

    // Handle bulk delete by date range
    const handleBulkDelete = async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            toast.error("Vui lòng chọn khoảng thời gian để xóa");
            return;
        }

        try {
            setIsDeleting(true);
            const res = await fetch(`/api/admin/kiem-nhiem-backup`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: dateRange[0].toISOString(),
                    endDate: dateRange[1].toISOString()
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Xóa dữ liệu thành công");
                setIsDeleteModalVisible(false);
                fetchData();
            } else {
                toast.error(data.message || "Không thể xóa dữ liệu");
            }
        } catch (err) {
            console.error("Error bulk deleting records:", err);
            toast.error("Lỗi khi xóa dữ liệu");
        } finally {
            setIsDeleting(false);
        }
    };

    // Export data to Excel
    const handleExportExcel = () => {
        try {
            toast.loading("Đang xuất file Excel...");
            exportPCKiemNhiem(dataList)
                .then(() => {
                    toast.dismiss();
                    toast.success("Xuất file Excel thành công!");
                })
                .catch((error) => {
                    toast.dismiss();
                    console.error("Error exporting to Excel:", error);
                    toast.error("Lỗi khi xuất file Excel!");
                });
        } catch (error) {
            toast.dismiss();
            console.error("Error exporting to Excel:", error);
            toast.error("Lỗi khi xuất file Excel!");
        }
    };

    // Table columns definition
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 60,
            render: (_, __, index) => (current - 1) * pageSize + index + 1,
        },
        {
            title: 'Chức vụ',
            dataIndex: ['chucVu', 'tenCV'],
            key: 'chucVu',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: 'Người nhận nhiệm vụ',
            dataIndex: ['user', 'username'],
            key: 'user',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Ngày chuyển',
            dataIndex: 'transferredAt',
            key: 'transferredAt',
            render: (text) => (
                <Tag color="blue">
                    {text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}
                </Tag>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteRecord(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button size="small" type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="py-1 px-3 shadow-xl bg-white rounded-xl mt-1 h-[92vh] flex flex-col">
            <div className="justify-between items-center mb-2">
                <div className="font-bold text-center text-base-bold text-blue-500 mb-2">
                    <HistoryOutlined /> LỊCH SỬ PHÂN CÔNG KIÊM NHIỆM
                </div>
                
                <div className="flex justify-between items-center mb-2">
                    <Space>
                        <RangePicker 
                            placeholder={['Từ ngày', 'Đến ngày']}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                        />
                        <Button 
                            type="primary" 
                            icon={<SearchOutlined />}
                            onClick={() => fetchData()}
                        >
                            Tìm kiếm
                        </Button>
                    </Space>
                    
                    <Space>
                        <Button
                            className="button-lien-thong-vlvh text-white font-bold shadow-md"
                            onClick={handleExportExcel}
                            icon={<FileExcelOutlined />}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            danger
                            onClick={() => setIsDeleteModalVisible(true)}
                            icon={<DeleteOutlined />}
                        >
                            Xóa theo thời gian
                        </Button>
                    </Space>
                </div>
                
                {dateRange && dateRange[0] && dateRange[1] && (
                    <Alert
                        message={
                            <span>
                                Đang hiển thị dữ liệu từ {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}
                            </span>
                        }
                        type="info"
                        showIcon
                        className="mb-2"
                    />
                )}
            </div>

            {loading ? (
                <div className="flex-grow flex items-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="flex-grow overflow-auto">
                    <Table
                        columns={columns}
                        dataSource={dataList}
                        rowKey="_id"
                        pagination={false}
                        bordered
                        size="middle"
                        locale={{ emptyText: 'Không có dữ liệu' }}
                    />
                </div>
            )}

            <div className="mt-2 flex justify-end">
                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={total}
                    onChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50', '100']}
                    showTotal={(total) => `Tổng cộng ${total} bản ghi`}
                />
            </div>

            {/* Modal xác nhận xóa theo khoảng thời gian */}
            <Modal
                title={
                    <div className="flex items-center">
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Xác nhận xóa dữ liệu
                    </div>
                }
                open={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        loading={isDeleting}
                        onClick={handleBulkDelete}
                    >
                        Xóa
                    </Button>,
                ]}
            >
                <p>Bạn có chắc chắn muốn xóa tất cả dữ liệu lưu trữ kiêm nhiệm trong khoảng thời gian đã chọn?</p>
                {dateRange && dateRange[0] && dateRange[1] ? (
                    <Alert
                        message={
                            <span>
                                Dữ liệu sẽ bị xóa: từ ngày <strong>{dateRange[0].format('DD/MM/YYYY')}</strong> đến ngày <strong>{dateRange[1].format('DD/MM/YYYY')}</strong>
                            </span>
                        }
                        type="warning"
                        showIcon
                        className="mt-2"
                    />
                ) : (
                    <Alert
                        message="Vui lòng chọn khoảng thời gian trước khi xóa"
                        type="error"
                        showIcon
                        className="mt-2"
                    />
                )}
            </Modal>
        </div>
    );
};

export default KiemNhiemBackupPage;
