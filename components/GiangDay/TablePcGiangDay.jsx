
"use client";

import { Pagination, Spin, Table } from "antd";
import { useState } from "react";

const TablePcGiangDay = ({ namHoc, ky, listSelect }) => {
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const columns = [
    // {
    //   title: 'STT',
    //   dataIndex: 'index',
    //   width: 10,
    //   render: (text, record, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
    // },
    {
      title: 'Mã MH',
      dataIndex: 'maMH',
      key: 'maMH',
      render: (text) => <span style={{ color: 'blue', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Tên MH',
      dataIndex: 'tenMH',
      key: 'tenMH',
      render: (text) => <span style={{ color: 'green', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số TC',
      dataIndex: 'soTC',
      key: 'soTC',
      render: (text) => <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số SV',
      dataIndex: 'soSVDK',
      key: 'soSVDK',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    // {
    //   title: 'Giảng viên',
    //   dataIndex: 'gvGiangDay',
    //   key: 'gvGiangDay',
    //   render: (text) => <span style={{ fontWeight: 'bold', color: 'orange' }}>{text}</span>,
    // },
    {
      title: 'Nhóm',
      dataIndex: 'nhom',
      key: 'nhom',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Thứ',
      dataIndex: 'thu',
      key: 'thu',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Tiết BĐ',
      dataIndex: 'tietBD',
      key: 'tietBD',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số tiết',
      dataIndex: 'soTiet',
      key: 'soTiet',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Phòng',
      dataIndex: 'phong',
      key: 'phong',
      width: 50,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Lớp',
      dataIndex: 'lop',
      key: 'lop',
      width: 145,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    // {
    //   title: 'Tuần bắt đầu học',
    //   dataIndex: 'tuanHoc',
    //   key: 'tuanHoc',
    //   render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    // },
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

export default TablePcGiangDay;
