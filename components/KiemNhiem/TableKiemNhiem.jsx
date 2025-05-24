
"use client";

import { useState } from "react";
import { Table, Spin, Pagination, Space } from "antd";
import { useSession } from "next-auth/react";

import dayjs from 'dayjs';


const TableKiemNhiem = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: session } = useSession();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: '60px',
      align: 'center',
    },
    {
      title: 'Chức vụ / Công việc',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => <span className="text-blue-600 font-medium">{text.tenCV}</span>,
      width: '20%',
      sorter: (a, b) => a.chucVu.tenCV.localeCompare(b.chucVu.tenCV),
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
      width: '15%',
      align: 'center',
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => <span className="text-blue-600 font-medium">{dayjs(text).format('DD/MM/YYYY')}</span>,
      width: '15%',
      align: 'center',
      sorter: (a, b) => new Date(a.endTime) - new Date(b.endTime),
    },
    {
      title: 'Miễn giảm',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => <span className="text-red-600 font-medium">{text?.soMien}</span>,
      width: '10%',
      align: 'center',
      sorter: (a, b) => a.chucVu.soMien - b.chucVu.soMien,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      width: '20%',
      ellipsis: true,
    },
  ];
  // Phân trang dữ liệu
  const paginatedData = data.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <div className="flex flex-col">
      {loading ? (
        <div className="mx-auto text-center w-full p-4">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 290px)' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false}
            className="custom-table"
            bordered
            size="middle"
            scroll={{ x: 'max-content' }}
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
