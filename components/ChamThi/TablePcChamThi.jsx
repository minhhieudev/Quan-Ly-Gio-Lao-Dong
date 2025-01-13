
"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';
import { useSession } from "next-auth/react";

const TablePcChamThi = ({ namHoc, ky, listSelect }) => {
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
          {text}
        </span>
      ),
    },
    {
      title: 'Nhóm/Lớp',
      dataIndex: 'nhomLop',
      key: 'nhomLop',
      render: (text) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {text}
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
      title: 'Cán bộ 1',
      dataIndex: 'cb1',
      key: 'cb1',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text}</span>,
    },
    {
      title: 'Cán bộ 2',
      dataIndex: 'cb2',
      key: 'cb2',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text}</span>,
    },
    {
      title: 'Số bài',
      dataIndex: 'soBai',
      key: 'soBai',
      width: 20,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'HT',
      dataIndex: 'hinhThuc',
      key: 'hinhThuc',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      width: 20,

    },
    {
      title: 'TG',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      width: 20,

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
        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 290px)' }}>
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

export default TablePcChamThi;
