
"use client";

import { Pagination, Spin, Table } from "antd";
import { useSession } from "next-auth/react";
import { useState } from "react";

const TablePcCoiThi = ({ namHoc, ky, listSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: session } = useSession();

  const columns = [
    {
      title: <span className="font-semibold">STT</span>,
      dataIndex: 'index',
      width: '5%',
      align: 'center',
      render: (text, record, index) => <span className="font-medium">{index + 1}</span>,
    },
    {
      title: <span className="font-semibold">Học phần</span>,
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      width: '18%',
      render: (text) => (
        <span className="text-green-600 font-medium">
          {Array.isArray(text) ? text.join(' | ') : text}
        </span>
      ),
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Kỳ</span>,
      dataIndex: 'ky',
      key: 'ky',
      width: '6%',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: <span className="font-semibold">Đợt</span>,
      dataIndex: 'loaiKyThi',
      key: 'loaiKyThi',
      width: '6%',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: <span className="font-semibold">Nhóm/Lớp</span>,
      dataIndex: 'lop',
      key: 'lop',
      width: '10%',
      render: (text) => (
        <span className="text-red-600 font-medium">
          {Array.isArray(text) ? text.join(' | ') : text}
        </span>
      ),
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Ngày thi</span>,
      dataIndex: 'ngayThi',
      key: 'ngayThi',
      width: '10%',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: <span className="font-semibold">Ca</span>,
      dataIndex: 'ca',
      key: 'ca',
      width: '5%',
      align: 'center',
      render: (text) => <span className="text-orange-500 font-medium">{text}</span>,
    },
    {
      title: <span className="font-semibold">Phòng thi</span>,
      dataIndex: 'phong',
      key: 'phong',
      width: '10%',
      align: 'center',
      render: (text) => <span className="font-medium">{Array.isArray(text) ? text.join(' - ') : text}</span>,
    },
    {
      title: <span className="font-semibold">Cán bộ 1</span>,
      dataIndex: 'cbo1',
      key: 'cbo1',
      width: '10%',
      render: (text) => <span className="text-blue-600 font-medium">{Array.isArray(text) ? text.join(' - ') : text}</span>,
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Cán bộ 2</span>,
      dataIndex: 'cbo2',
      key: 'cbo2',
      width: '10%',
      render: (text) => <span className="text-blue-600 font-medium">{Array.isArray(text) ? text.join(' - ') : text}</span>,
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Thời gian</span>,
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      width: '8%',
      align: 'center',
      render: (text) => (
        <span className="font-medium">
          {Array.isArray(text) ? text.join(' - ') : text}
        </span>
      ),
    },
    {
      title: <span className="font-semibold">Địa điểm</span>,
      dataIndex: 'diaDiem',
      key: 'diaDiem',
      width: '7%',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Ghi chú</span>,
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      width: '5%',
      render: (text) => text ? <span className="text-gray-700">{text}</span> : null,
      ellipsis: true
    },
  ];

  // Phân trang dữ liệu
  const paginatedData = listSelect.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <div className="flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="flex-grow overflow-auto" style={{ maxHeight: '60vh' }}>
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="_id"
              pagination={false}
              bordered
              size="middle"
              className="custom-table"
              scroll={{ x: 'max-content' }}
            />
          </div>

          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={listSelect.length}
              onChange={(page, size) => {
                setCurrent(page);
                setPageSize(size);
              }}
              pageSizeOptions={['5', '10', '25', '50']}
              showSizeChanger
              showTotal={(total) => `Tổng cộng ${total} bản ghi`}
              className="flex justify-end"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePcCoiThi;
