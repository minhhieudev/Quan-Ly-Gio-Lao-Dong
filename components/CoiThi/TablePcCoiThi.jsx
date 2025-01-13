
"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';
import { useSession } from "next-auth/react";

const TablePcCoiThi = ({ namHoc, ky ,listSelect}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: session } = useSession();
  const user = session?.user;

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 10,
      render: (text, record, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
    },
    {
      title: 'Học phần',
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      render: (text) => (
        <span style={{ color: 'green', fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(' | ') : text}
        </span>
      ),
    },
    {
      title: 'Nhóm/Lớp',
      dataIndex: 'lop',
      key: 'lop',
      render: (text) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(' | ') : text}
        </span>
      ),
    },
    {
      title: 'Ngày thi',
      dataIndex: 'ngayThi',
      key: 'ngayThi',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Ca',
      dataIndex: 'ca',
      key: 'ca',
      width: '1%',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'orange' }}>{text}</span>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'phong',
      key: 'phong',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text.join(' - ')}</span>,
    },
    {
      title: 'Cán bộ 1',
      dataIndex: 'cbo1',
      key: 'cbo1',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text.join(' - ')}</span>,
    },
    {
      title: 'Cán bộ 2',
      dataIndex: 'cbo2',
      key: 'cbo2',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text.join(' - ')}</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      width: 20,
      render: (text) => (
        <span style={{ fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(' - ') : text}
        </span>
      ),
    },
    {
      title: 'Địa điểm thi',
      dataIndex: 'diaDiem',
      key: 'diaDiem',
      width: 20,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
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
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div className="flex-grow overflow-auto" style={{ maxHeight: '49vh' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false} // Tắt phân trang trên Table
          />
        </div>
      )}

      <div className="mt-2 ">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={listSelect.length}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={['5', '10', '25', '50', '100']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default TablePcCoiThi;
