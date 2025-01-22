
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
    },
    {
      title: 'Chức vụ / Công việc',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => text.tenCV,
      className: 'text-red-700 font-bold ',

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
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      className: 'text-green-700 font-bold ',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      className: 'text-blue-700 font-bold ',
    },
    {
      title: '% miễn giảm',
      dataIndex: 'chucVu',
      key: 'chucVu',
      render: (text) => text?.soMien,
      className: ' font-bold ',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      className: 'text-black font-bold',

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
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div className="flex-grow overflow-auto cus-table" style={{ maxHeight: 'calc(85vh - 290px)' }}>
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
          total={data.length}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={['5', '10', '25', '50', '100']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>

      <div className="">

      </div>
    </div>
  );
};

export default TableKiemNhiem;
