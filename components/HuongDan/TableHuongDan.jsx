
"use client";

import { useState } from "react";
import {  Table, Spin, Pagination } from "antd";
import { useSession } from "next-auth/react";



const TableHuongDan = ({ data}) => {
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: session } = useSession();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 10,
      render: (text, record, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
    },
    {
      title: 'tenCV',
      dataIndex: 'tenCV',
      key: 'tenCV',
      render: (text) => <span style={{ color: 'blue', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      render: (text) => <span style={{ color: 'green', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số giờ',
      dataIndex: 'soGio',
      key: 'soGio',
      render: (text) => <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span>,
    },
    // {
    //   title: 'Số SV',
    //   dataIndex: 'soSVDK',
    //   key: 'soSVDK',
    //   width: '1%',
    //   render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    // },
   
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
        <div className="flex-grow overflow-auto cus-table" style={{ maxHeight: 'calc(85vh - 120px)' }}>
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
    </div>
  );
};

export default TableHuongDan;
