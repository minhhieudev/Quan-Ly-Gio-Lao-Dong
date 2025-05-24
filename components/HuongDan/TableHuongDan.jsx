
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
      title: <span className="font-semibold">STT</span>,
      dataIndex: 'index',
      width: '8%',
      align: 'center',
      render: (text, record, index) => <span className="font-medium">{index + 1}</span>,
    },
    {
      title: <span className="font-semibold">Tên công việc</span>,
      dataIndex: 'tenCV',
      key: 'tenCV',
      width: '30%',
      render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Mô tả</span>,
      dataIndex: 'moTa',
      key: 'moTa',
      width: '45%',
      render: (text) => <span className="text-green-600">{text}</span>,
      ellipsis: true
    },
    {
      title: <span className="font-semibold">Số giờ</span>,
      dataIndex: 'soGio',
      key: 'soGio',
      width: '17%',
      align: 'center',
      render: (text) => <span className="text-red-600 font-bold">{text}</span>,
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
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 290px)' }}>
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="_id"
              pagination={false}
              bordered
              size="middle"
              className="custom-table"
            />
          </div>
          
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={data.length}
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

export default TableHuongDan;
