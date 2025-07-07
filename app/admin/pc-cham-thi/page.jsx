"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';
import { exportChamThi } from '@/lib/fileExport';
import { getAcademicYearConfig } from '@lib/academicYearUtils';


const { Option } = Select;

const PcChamThiTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loaiKyThi, setLoaiKyThi] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [loai, setLoai] = useState("Chính quy");

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [hocKy, setHocKy] = useState("1");

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);


  const router = useRouter();

  useEffect(() => {
    if (!namHoc && !loaiKyThi) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/giaovu/pc-cham-thi?namHoc=${namHoc}&hocKy=${hocKy}&loaiKyThi=${loaiKyThi}&loai=${loai}`, {

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
  }, [namHoc, loaiKyThi, loai, hocKy]);

  useEffect(() => {
    const filtered = dataList.filter((item) => {
      if (Array.isArray(item.hocPhan)) {
        // Nếu hocPhan là mảng, kiểm tra xem bất kỳ phần tử nào trong mảng có chứa searchTerm không
        return item.hocPhan.some(
          (hp) =>
            typeof hp === 'string' &&
            hp.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
      } else if (typeof item.hocPhan === 'string') {
        // Nếu hocPhan là chuỗi, kiểm tra trực tiếp
        return item.hocPhan
          .trim()
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());
      }
      return false;
    });
    setFilteredData(filtered);
  }, [searchTerm, dataList]);



  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/giaovu/pc-cham-thi`, {
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

  const handleExport = () => {
    exportChamThi(filteredData, hocKy, namHoc, loaiKyThi, loai);
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
      title: 'Cán bộ chấm thi 1',
      dataIndex: 'cb1',
      key: 'cb1',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text}</span>,
    },
    {
      title: 'Cán bộ chấm thi 2',
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
      width: 60,
    },
    {
      title: 'TG',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      width: 60,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => router.push(`/admin/pc-cham-thi/edit/${record._id}`)} type="primary">Sửa</Button>
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
    <div className="py-1 px-3 shadow-xl bg-white rounded-xl mt-1 h-[92vh] flex flex-col">

      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-2">
          <div className="font-bold text-small-bold">LOẠI:</div>
          <Select value={loai} size="small" placeholder="Chọn loại hình đào tạo..." onChange={(value) => setLoai(value)}>
            <Option value="Chính quy">Chính quy</Option>
            <Option value="Liên thông vlvh">Liên thông vlvh</Option>
          </Select>
        </div>
        <h2 className="font-bold text-[18px] text-center text-green-500">DANH SÁCH PHÂN CÔNG CHẤM THI</h2>
        <Button
          className="button-dang-day text-white font-bold shadow-md mb-2 text-small-bold"
          onClick={() => router.push(`/admin/pc-cham-thi/create`)}
        >
          TẠO MỚI
        </Button>
      </div>
      <div className="flex justify-between items-center mb-2 text-small-bold">
        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select size="small"
            placeholder="Chọn năm học"
            onChange={(value) => setNamHoc(value)}
            className="w-[50%]"
            value={namHoc}
          >
            {namHocOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </div>

        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Học kỳ:</label>
          <Select size="small" allowClear
            placeholder="Chọn học kỳ"
            onChange={(value) => setHocKy(value)}
            className="w-[50%]"
            value={hocKy}
          >
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="he">Hè</Option>
          </Select>
        </div>


        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Loại kỳ thi:</label>
          <Select allowClear size="small"
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
          <Input.Search size="small"
            placeholder="Tìm kiếm học phần..."
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
        <div className="flex-grow overflow-auto text-small-bold" style={{ maxHeight: 'calc(85vh - 80px)' }}>
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
          className="button-lien-thong-vlvh text-white font-bold shadow-md"
          onClick={handleExport}
        >
          <FileExcelOutlined />
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
          pageSizeOptions={['10', '25', '50', '100', '200']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default PcChamThiTable;
