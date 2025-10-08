"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined, DeleteOutlined, EditOutlined, ClearOutlined } from '@ant-design/icons';
import { exportPCGD } from "@lib/fileExport";
import { getAcademicYearConfig } from "@lib/academicYearUtils";


const { Option } = Select;

const TeachingAssignmentTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLecturer, setSearchLecturer] = useState("");
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [loading, setLoading] = useState(false);
  const [khoaOptions, setKhoaOptions] = useState([]);
  const [userList, setUserList] = useState([]);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loai, setLoai] = useState("Chính quy");

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);
  const [kiHoc, setKiHoc] = useState("");

  const router = useRouter();

  // Load khoa options
  useEffect(() => {
    const fetchKhoaOptions = async () => {
      try {
        const res = await fetch('/api/admin/khoa');
        if (res.ok) {
          const data = await res.json();
          setKhoaOptions(data);
        }
      } catch (err) {
        console.error("Error fetching khoa options:", err);
      }
    };

    fetchKhoaOptions();
  }, []);

  // Load user list to map lecturers to departments
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const res = await fetch('/api/admin/user');
        if (res.ok) {
          const data = await res.json();
          setUserList(data);
        }
      } catch (err) {
        console.error("Error fetching user list:", err);
      }
    };

    fetchUserList();
  }, []);

  useEffect(() => {
    if (!namHoc && !kiHoc) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/giaovu/pc-giang-day?namHoc=${namHoc}&loai=${loai}&kiHoc=${kiHoc}`, {
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
  }, [namHoc, kiHoc, loai]);

  // Helper function to get lecturer's department
  const getLecturerDepartment = (lecturerName) => {
    const user = userList.find(u => u.username === lecturerName);
    return user ? user.khoa : '';
  };

  useEffect(() => {
    let filtered = dataList;

    // Filter by subject (môn học)
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.maMH.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenMH.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by lecturer name (giảng viên)
    if (searchLecturer) {
      filtered = filtered.filter((item) =>
        item.gvGiangDay.toLowerCase().includes(searchLecturer.toLowerCase())
      );
    }

    // Filter by department (khoa)
    if (selectedKhoa) {
      filtered = filtered.filter((item) => {
        const lecturerDepartment = getLecturerDepartment(item.gvGiangDay);
        return lecturerDepartment === selectedKhoa;
      });
    }

    setFilteredData(filtered);
  }, [searchTerm, searchLecturer, selectedKhoa, dataList, userList]);

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

  const handleDeleteByYear = async () => {
    if (!namHoc) {
      toast.error("Vui lòng chọn năm học để xóa!");
      return;
    }

    try {
      const res = await fetch(`/api/giaovu/pc-giang-day/delete-by-year`, {
        method: "DELETE",
        body: JSON.stringify({ namHoc, loai, kiHoc }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Đã xóa ${result.deletedCount} bản ghi của năm học ${namHoc} (${loai})`);
        // Refresh data after deletion
        const fetchRes = await fetch(`/api/giaovu/pc-giang-day?namHoc=${namHoc}&loai=${loai}&kiHoc=${kiHoc}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setDataList(data);
          setFilteredData(data);
        }
      } else {
        toast.error("Xóa thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa dữ liệu!");
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
      title: 'Địa điểm',
      dataIndex: 'diaDiem',
      key: 'diaDiem',
      width: 145,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    // {
    //   title: 'Tuần bắt đầu học',
    //   dataIndex: 'tuanHoc',
    //   key: 'tuanHoc',
    //   render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    // },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            onClick={() => router.push(`/admin/pc-giang-day/edit/${record._id}`)} 
            type="primary" 
            icon={<EditOutlined />}
            title="Sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              size="small" 
              type="primary" 
              danger
              icon={<DeleteOutlined />}
              title="Xóa"
            />
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
      <div className="flex items-center justify-center mb-3">
        <div className="flex gap-2">
          <div className="text-[14px] font-bold">LOẠI:</div>
          <Select value={loai} size="small" placeholder="Chọn loại hình đào tạo..." onChange={(value) => setLoai(value)} allowClear >
            <Option value="Chính quy">Chính quy</Option>
            <Option value="Liên thông vlvh">Liên thông vlvh</Option>
          </Select>
        </div>
        <h2 className="font-bold  flex-grow text-center text-[18px] text-green-500">DANH SÁCH PHÂN CÔNG GIẢNG DẠY</h2>
        <Button
          className="button-dang-day text-white font-bold shadow-md mb-0"
          onClick={() => router.push(`/admin/pc-giang-day/create`)}
        >
          TẠO MỚI
        </Button>
      </div>
      <div className="flex justify-between items-center mb-2 text-small-bold">
        <div className="w-[20%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select size="small" value={namHoc}
            placeholder="Chọn năm học"
            onChange={(value) => setNamHoc(value)}
            className="w-[70%]"
          >
            {namHocOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </div>

        <div className="w-[15%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Học kỳ:</label>
          <Select size="small" allowClear value={kiHoc}
            placeholder="Chọn học kỳ"
            onChange={(value) => setKiHoc(value)}
            className="w-[60%]"
          >
            <Option value="1"> 1</Option>
            <Option value="2"> 2</Option>
            <Option value="he">Hè</Option>
          </Select>
        </div>

        <div className="w-[20%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Khoa:</label>
          <Select size="small" allowClear value={selectedKhoa}
            placeholder="Chọn khoa"
            onChange={(value) => setSelectedKhoa(value)}
            className="w-[70%]"
          >
            {khoaOptions.map(khoa => (
              <Option key={khoa._id} value={khoa.tenKhoa}>{khoa.tenKhoa}</Option>
            ))}
          </Select>
        </div>
        <div className="">
          <Input.Search size="small"
            placeholder="Tìm kiếm môn học..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="">
          <Input.Search size="small"
            placeholder="Tìm kiếm giảng viên..."
            allowClear
            value={searchLecturer}
            onChange={(e) => setSearchLecturer(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false} // Tắt phân trang trên Table
          />
        </div>
      )}

      <div className="mt-2 flex justify-between">
        <div className="flex gap-2">
          <Button
            className="button-lien-thong-vlvh text-white font-bold shadow-md "
            onClick={() => exportPCGD(filteredData, kiHoc, namHoc, selectedKhoa)}
          ><FileExcelOutlined />
            Xuất file Excel
          </Button>
          <Popconfirm
            title={`Bạn có chắc chắn muốn xóa tất cả dữ liệu của năm học ${namHoc || 'đã chọn'} (${loai})?`}
            description="Hành động này không thể hoàn tác!"
            onConfirm={handleDeleteByYear}
            okText="Có, xóa tất cả"
            cancelText="Không"
            okType="danger"
          >
            <Button
              className="bg-red-500 text-white font-bold shadow-md hover:bg-red-600"
              disabled={!namHoc}
              icon={<ClearOutlined />}
            >
              Xóa dữ liệu năm học
            </Button>
          </Popconfirm>
        </div>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={['10', '25', '50', '100', '200', '500', '1000']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default TeachingAssignmentTable;
