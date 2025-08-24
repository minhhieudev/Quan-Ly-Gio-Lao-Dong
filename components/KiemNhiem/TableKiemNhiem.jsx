"use client";

import { Pagination, Space, Spin, Table } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from "antd";
import dayjs from 'dayjs';


const TableKiemNhiem = ({ data, handleEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const columns = [
    // {
    //   title: 'STT',
    //   dataIndex: 'stt',
    //   key: 'stt',
    //   render: (_, __, index) => index + 1,
    //   width: '10px',
    //   align: 'center',
    // },
    {
      title: 'Chức vụ / Công việc',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => <span className="text-blue-600 font-medium">{text?.tenCV || ''}</span>,
      width: '12%',
      sorter: (a, b) => (a.chucVu?.tenCV || '').localeCompare(b.chucVu?.tenCV || ''),
    },
    // {
    //   title: 'Người nhận nhiệm vụ',
    //   dataIndex: 'user',
    //   key: 'user',
    //   render: (text) => text.username,
    //   className: 'text-blue-700 font-bold ',

    // },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => <span className="text-green-600 font-medium">{dayjs(text).format('DD/MM/YYYY')}</span>,
      width: '11%',
      align: 'center',
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => {
        if (!text || !dayjs(text).isValid()) {
          return <span className="text-gray-400">-</span>;
        }
        return <span className="text-blue-600 font-medium">{dayjs(text).format('DD/MM/YYYY')}</span>;
      },
      width: '11%',
      align: 'center',
      sorter: (a, b) => {
        const dateA = a.endTime ? new Date(a.endTime) : new Date(0);
        const dateB = b.endTime ? new Date(b.endTime) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: 'Miễn giảm',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => <span className="text-red-600 font-medium">{text?.soMien}</span>,
      width: '9%',
      align: 'center',
      sorter: (a, b) => a.chucVu.soMien - b.chucVu.soMien,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      width: '8%',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: '8%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">

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
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
          <Button
            size="small"
            onClick={() => handleEdit(record)}
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 flex items-center"
            icon={<EditOutlined />}
            title="Sửa"
          />
        </Space>
      )
    },
  ];
  // Phân trang dữ liệu
  const paginatedData = data.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/kiem-nhiem-user", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Xóa thất bại");
      }

      toast.success("Đã xóa chức vụ!");

      // Thông báo cho component cha cập nhật lại data
      if (onDelete) {
        await onDelete(id);
      }

      // Reset về trang đầu sau khi xóa
      setCurrent(1);

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Có lỗi xảy ra khi xóa dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {loading ? (
        <div className="mx-auto text-center w-full p-4">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 340px)' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false}
            className="custom-table"
            bordered
            size="middle"
            scroll={{ x: 900 }}
          />
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-2 rounded-md border border-gray-200">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={data.length}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={['5', '10', '25', '50', '100']}
          showSizeChanger
          showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default TableKiemNhiem;
