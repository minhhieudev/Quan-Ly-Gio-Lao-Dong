"use client";

import { useState, useEffect, useCallback } from "react";
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

  const [khoaOptions, setKhoaOptions] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");

  useEffect(() => {
    const getListKhoa = async () => {
      try {
        const res = await fetch(`/api/admin/khoa`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          // Chỉ lấy thuộc tính 'tenKhoa' từ dữ liệu
          const tenKhoaList = data.map(khoa => khoa.tenKhoa);
          setKhoaOptions(tenKhoaList);
        } else {
          toast.error("Failed to get khoa");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data khoa");
      }
    };

    getListKhoa();
  }, []);

  // Tạo hàm fetchData với useCallback để tránh tạo lại hàm mỗi lần render
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: current.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (selectedKhoa) {
        queryParams.append('khoa', selectedKhoa);
      }

      const res = await fetch(`/api/admin/hoc-phan?${queryParams}`, {
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
  }, [current, pageSize, searchTerm, selectedKhoa]);

  // Xử lý thay đổi trang và pageSize - gọi API ngay lập tức
  useEffect(() => {
    fetchData();
  }, [current, pageSize]);

  // Xử lý tìm kiếm và lọc khoa - có debounce 1 giây
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Chỉ áp dụng debounce khi có thay đổi về searchTerm hoặc selectedKhoa
      if (searchTerm !== undefined || selectedKhoa !== undefined) {
        fetchData();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedKhoa, fetchData]);

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

  // Cập nhật hàm xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrent(1); // Reset về trang 1 khi tìm kiếm
  };

  // Cập nhật hàm xử lý chọn khoa
  const handleKhoaChange = (value) => {
    setSelectedKhoa(value);
    setCurrent(1); // Reset về trang 1 khi chọn khoa
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
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="w-[25%] flex items-center gap-2 font-bold">
            <div className="text-base-bold">Khoa:</div>
            <Select size="small"
              className="w-[40%]"
              placeholder="Lọc theo khoa"
              allowClear
              value={selectedKhoa}
              onChange={handleKhoaChange}
            >
              {khoaOptions.map(khoa => (
                <Option key={khoa} value={khoa}>
                  {khoa}
                </Option>
              ))}
            </Select>
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
