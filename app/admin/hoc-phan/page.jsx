"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';
import { exportHocPhan } from "@lib/fileExport";

const { Option } = Select;

const TeachingAssignmentTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/hoc-phan?page=${current}&pageSize=${pageSize}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const { assignments, total } = await res.json();
          setDataList(assignments);
          setFilteredData(assignments);
          setTotal(total);
        } else {
          toast.error("Không thể tải dữ liệu học phần");
        }
        setLoading(false);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu học phần");
        setLoading(false);
      }
    };

    fetchData();
  }, [current, pageSize]);

  useEffect(() => {
    const filtered = dataList.filter((item) =>
      item?.maMH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.tenMH?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/hoc-phan`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setDataList((prevData) => prevData.filter((item) => item._id !== id));
        toast.success("Xoá thành công!");
      } else {
        toast.error("Xoá thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      render: (text, record, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
    },
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
      title: 'Số tiết LT',
      dataIndex: 'soTietLT',
      key: 'soTietLT',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số tiết TH',
      dataIndex: 'soTietTH',
      key: 'soTietTH',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'orange' }}>{text}</span>,
    },
    {
      title: 'Trình độ',
      dataIndex: 'trinhDo',
      key: 'trinhDo',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số HSSV/nhóm',
      dataIndex: 'soLuong',
      key: 'soLuong',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Hệ số quy đổi',
      dataIndex: 'heSo',
      key: 'heSo',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => router.push(`/admin/hoc-phan/edit/${record._id}`)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 20
    },
  ];

  return (
    <div className="py-1 px-3 shadow-xl bg-white rounded-xl mt-1 h-[92vh] flex flex-col">
      <div className=" justify-between items-center mb-0 text-small-bold">
        <div className="font-bold text-center text-base-bold text-blue-500">DANH SÁCH HỌC PHẦN</div>
        <div className=" flex justify-between w-full">
          <div className="w-[20%]">
            <Input.Search size="small"
              placeholder="Tìm kiếm môn học..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="button-dang-day text-white font-bold shadow-md mb-0"
            onClick={() => router.push(`/admin/hoc-phan/create`)}
          >
            TẠO MỚI
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div className="flex-grow overflow-auto mt-2" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={false} // Tắt phân trang trên Table
          />
        </div>
      )}

      <div className="mt-2 flex justify-between">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md "
          onClick={() => exportHocPhan(dataList)}
        ><FileExcelOutlined />
          Xuất file Excel
        </Button>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={['10', '25', '50', '100', '200', '500']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default TeachingAssignmentTable;
