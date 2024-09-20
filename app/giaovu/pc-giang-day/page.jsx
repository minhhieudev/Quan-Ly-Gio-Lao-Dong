"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';


const { Option } = Select;

const TeachingAssignmentTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [namHoc, setNamHoc] = useState("");
  const [kiHoc, setKiHoc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const router = useRouter();

  useEffect(() => {
    if (!namHoc && !kiHoc) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/giaovu/pc-giang-day?namHoc=${namHoc}&kiHoc=${kiHoc}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setDataList(data);
          setFilteredData(data);
        } else {
          toast.error("Không thể tải dữ liệu");
        }
        setLoading(false);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchData();
  }, [namHoc, kiHoc]);

  useEffect(() => {
    const filtered = dataList.filter((item) =>
      item.maMH.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tenMH.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/giaovu/pc-giang-day`, {
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
      width: 10,
      render: (text, record, index) => <span style={{ fontWeight: 'bold' }}>{index + 1}</span>,
    },
    {
      title: 'Mã MH',
      dataIndex: 'maMH',
      key: 'maMH',
      width: 20,
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
      width: '1%',
      render: (text) => <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số SV',
      dataIndex: 'soSVDK',
      key: 'soSVDK',
      width: '1%',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'gvGiangDay',
      key: 'gvGiangDay',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'orange' }}>{text}</span>,
    },
    {
      title: 'Nhóm',
      dataIndex: 'nhom',
      key: 'nhom',
      width: 20,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Thứ',
      dataIndex: 'thu',
      key: 'thu',
      width: 20,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Tiết BĐ',
      dataIndex: 'tietBD',
      key: 'tietBD',
      width: 20,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Số tiết',
      dataIndex: 'soTiet',
      key: 'soTiet',
      width: 20,
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
    {
      title: 'Tuần bắt đầu học',
      dataIndex: 'tuanHoc',
      key: 'tuanHoc',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" onClick={() => router.push(`/giaovu/pc-giang-day/edit/${record._id}`)} type="primary">Sửa</Button>
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
      width: 20,
    },
  ];

  // Phân trang dữ liệu
  const paginatedData = filteredData.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <div className="py-2 px-3 shadow-xl bg-white rounded-xl mt-3 h-[85vh] flex flex-col">
      <div className="flex items-center justify-center mb-3">
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">DANH SÁCH PHÂN CÔNG GIẢNG DẠY</h2>
        <Button
          className="button-dang-day text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/giaovu/pc-giang-day/create`)}
        >
          TẠO MỚI
        </Button>
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select
            placeholder="Chọn năm học"
            onChange={(value) => setNamHoc(value)}
            className="w-[50%]"
          >
            <Option value="2021-2022">2021-2022</Option>
            <Option value="2022-2023">2022-2023</Option>
            <Option value="2023-2024">2023-2024</Option>
            <Option value="2024-2025">2024-2025</Option>
          </Select>
        </div>

        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Kỳ học:</label>
          <Select
            placeholder="Chọn kỳ học"
            onChange={(value) => setKiHoc(value)}
            className="w-[50%]"
          >
            <Option value="1">Kỳ 1</Option>
            <Option value="2">Kỳ 2</Option>
          </Select>
        </div>

        <div className="w-[20%]">
          <Input.Search
            placeholder="Tìm kiếm môn học..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false} // Tắt phân trang trên Table
          />
        </div>
      )}

      <div className="mt-2 flex justify-between">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md "
          //onClick={() => exportToExcelTongHop() }
        ><FileExcelOutlined />
          Xuất file Excel
        </Button>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={filteredData.length}
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

export default TeachingAssignmentTable;
