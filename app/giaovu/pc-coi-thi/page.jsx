"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';


const { Option } = Select;

const PcCoiThiTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [namHoc, setNamHoc] = useState("");
  const [loaiKyThi, setLoaiKyThi] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [loai, setLoai] = useState("chinh-quy");

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const router = useRouter();

  useEffect(() => {
    if (!namHoc && !loaiKyThi) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/giaovu/pc-coi-thi?namHoc=${namHoc}&loaiKyThi=${loaiKyThi}&loai=${loai}`, {
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
  }, [namHoc, loaiKyThi, loai]);

  useEffect(() => {
    const filtered = dataList.filter((item) =>
      item.cb1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cb2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hocPhan.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/giaovu/pc-coi-thi`, {
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
      title: 'Học phần',
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      render: (text) => (
        <span style={{ color: 'green', fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(', ') : text}
        </span>
      ),
    },
    {
      title: 'Nhóm/Lớp',
      dataIndex: 'nhomLop',
      key: 'nhomLop',
      render: (text) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(', ') : text}
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
      dataIndex: 'phongThi',
      key: 'phongThi',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Cán bộ coi thi 1',
      dataIndex: 'cb1',
      key: 'cb1',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Cán bộ coi thi 2',
      dataIndex: 'cb2',
      key: 'cb2',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Thời gian (phút)',
      dataIndex: 'time',
      key: 'time',
      width: 20,
      render: (text) => (
        <span style={{ fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(', ') : text}
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
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" onClick={() => router.push(`/giaovu/pc-coi-thi/edit/${record._id}`)} type="primary">Sửa</Button>
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

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <div className="text-heading4-bold">LOẠI:</div>
          <Select placeholder="Chọn loại hình đào tạo..." onChange={(value) => setLoai(value)}>
            <Option value="chinh-quy">Chính quy</Option>
            <Option value="lien-thong-vlvh">Liên thông vừa làm vừa học</Option>
          </Select>
        </div>
        <h2 className="font-bold text-heading3-bold text-center text-green-500">DANH SÁCH PHÂN CÔNG COI THI</h2>
        <Button
          className="button-dang-day text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/giaovu/pc-coi-thi/create`)}
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
          <label className="block text-sm font-semibold mb-1">Loại kỳ thi:</label>
          <Select
            placeholder="Chọn loại kỳ thi"
            onChange={(value) => setLoaiKyThi(value)}
            className="w-[50%]"
          >
            <Option value="Học kỳ 1">Học kỳ 1</Option>
            <Option value="Học kỳ 1 (đợt 2)">Học kỳ 1 (đợt 2)</Option>
            <Option value="Học kỳ 1 (đợt 3)">Học kỳ 1 (đợt 3)</Option>
            <Option value="Học kỳ 2">Học kỳ 2</Option>
            <Option value="Học kỳ 2 (đợt 2)">Học kỳ 2 (đợt 2)</Option>
            <Option value="Học kỳ 2 (đợt 3)">Học kỳ 2 (đợt 3)</Option>
            <Option value="Kỳ thi phụ (đợt 1)">Kỳ thi phụ (đợt 1)</Option>
            <Option value="Kỳ thi phụ (đợt 2)">Kỳ thi phụ (đợt 2)</Option>
            <Option value="Kỳ thi phụ (đợt 3)">Kỳ thi phụ (đợt 3)</Option>
            <Option value="Học kỳ hè">Học kỳ hè</Option>
          </Select>
        </div>

        <div className="w-[20%]">
          <Input.Search
            placeholder="Tìm kiếm học phần, giảng viên..."
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

export default PcCoiThiTable;
