"use client";

import { useState, useEffect } from "react";
import { Select, Input, Table, Popconfirm, Spin, Button, Space, Pagination, Modal } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileExcelOutlined } from '@ant-design/icons';
import { exportLichThi } from '../../../lib/fileExport';
import { getAcademicYearConfig } from '@lib/academicYearUtils';


const { Option } = Select;

const PcCoiThiTable = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hocKy, setHocKy] = useState("1");
  const [loaiKyThi, setLoaiKyThi] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [loai, setLoai] = useState("Chính quy");

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentList, setCurrentList] = useState([]);

  const router = useRouter();

  useEffect(() => {
    fetchData2();
  }, [namHoc, loaiKyThi, loai, hocKy]);


  const fetchData2 = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pc-coi-thi?namHoc=${namHoc}&loaiKyThi=${loaiKyThi}&loai=${loai}&hocKy=${hocKy}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setDataList(data);
  
    } catch (err) {
      console.log('error:', err);
      toast.error("An error occurred while fetching data");
    }
  };
  

  useEffect(() => {

    const lowerSearchTerm = searchTerm?.toLowerCase() || '';
    const filtered = dataList.filter((item) =>
      (item?.hocPhan && Array.isArray(item.hocPhan) && item.hocPhan.some(hocPhan => hocPhan.toLowerCase().includes(lowerSearchTerm))) ||
      (item?.cbo1 && Array.isArray(item.cbo1) && item.cbo1.some(cbo => cbo.toLowerCase().includes(lowerSearchTerm))) ||
      (item?.cbo2 && Array.isArray(item.cbo2) && item.cbo2.some(cbo => cbo.toLowerCase().includes(lowerSearchTerm))))
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pc-coi-thi`, {
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

  const showModal = (danhSachThiSinh) => {
    const flattenedDanhSach = danhSachThiSinh.flat();

    const sortedDanhSach = flattenedDanhSach
      .filter(item => item.hoTen)
      .sort((a, b) => {
        // Tách tên theo khoảng trắng và lấy phần cuối cùng của tên
        const lastNameA = typeof a.hoTen === 'string' ? a.hoTen.trim().split(' ').pop().toLowerCase() : '';
        const lastNameB = typeof b.hoTen === 'string' ? b.hoTen.trim().split(' ').pop().toLowerCase() : '';
        return lastNameA.localeCompare(lastNameB);
      });

    // Sau đó gọi Modal để hiển thị danh sách đã sắp xếp
    setCurrentList(sortedDanhSach);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
      dataIndex: 'lop',
      key: 'lop',
      render: (text) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {Array.isArray(text)
            ? text.map(lop => Array.isArray(lop) ? lop.join(', ') : lop).join(' - ')
            : text}
        </span>
      ),
    },
    {
      title: 'Ngày thi',
      dataIndex: 'ngayThi',
      key: 'ngayThi',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      width: 110,
    },
    {
      title: 'Ca',
      dataIndex: 'ca',
      key: 'ca',
      width: '1%',
      render: (text) => <span style={{ fontWeight: "bold", color: "orange" }}>{text == '1' ? 'Sáng' : 'Chiều'}</span>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'phong',
      key: 'phong',
      width: 90,
      render: (text) => (
        <span style={{ fontWeight: "bold" }}>
          {Array.isArray(text) ? text.join(', ') : text}
        </span>
      ),
    },
    {
      title: 'Cán bộ 1',
      dataIndex: 'cbo1',
      key: 'cbo1',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text.join(' - ')}</span>,
    },
    {
      title: 'Cán bộ 2',
      dataIndex: 'cbo2',
      key: 'cbo2',
      render: (text) => <span style={{ fontWeight: 'bold', color: 'blue' }}>{text.join(' - ')}</span>,
    },
    {
      title: 'HT',
      dataIndex: 'hinhThuc',
      key: 'hinhThuc',
      width: 20,
      render: (text) => (
        <span style={{ fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(' - ') : text}
        </span>
      ),
    },
    {
      title: 'TG',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      width: 20,
      render: (text) => (
        <span style={{ fontWeight: 'bold' }}>
          {Array.isArray(text) ? text.join(' - ') : text}
        </span>
      ),
    },
    {
      title: 'DS SV',
      dataIndex: 'danhSachThiSinh',
      key: 'danhSachThiSinh',
      render: (text, record) => (
        <Button size="small" type="dashed" danger onClick={() => showModal(text)}>
          Xem
        </Button>

      ),
      width: 15,

    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => router.push(`/admin/pc-coi-thi/edit/${record._id}`)} type="primary">Sửa</Button>
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
    <div className="py-1 px-3 shadow-xl bg-white rounded-xl mt-2  flex flex-col">

      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-2">
          <div className="font-bold text-small-bold">LOẠI:</div>
          <Select size="small" value={loai} placeholder="Chọn loại hình đào tạo..." onChange={(value) => setLoai(value)}>
            <Option value="Chính quy">Chính quy</Option>
            <Option value="Liên thông vừa làm vừa học">Liên thông vừa làm vừa học</Option>
          </Select>
        </div>
        <h2 className="font-bold text-heading4-bold text-center text-green-500">DANH SÁCH PHÂN CÔNG COI THI</h2>
        <Button
          className="button-dang-day text-white font-bold shadow-md mb-1"
          onClick={() => router.push(`/admin/pc-coi-thi/create`)}
        >
          TẠO MỚI
        </Button>
      </div>
      <div className="flex justify-between items-center mb-1 text-small-bold">
        <div className="w-[25%] flex items-center gap-2 h-[10px]">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select value={namHoc} size="small" allowClear
            placeholder="Chọn năm học"
            onChange={(value) => setNamHoc(value)}
            className="w-[50%]"
          >
            {namHocOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </div>

        <div className="w-[25%] flex items-center gap-2 h-[10px]">
          <label className="block text-sm font-semibold mb-1">Kỳ:</label>
          <Select value={hocKy} size="small" allowClear
            placeholder="Chọn học kỳ"
            onChange={(value) => setHocKy(value)}
            className="w-[50%]"
          >
            <Option value="1">1</Option>
            <Option value="2">2</Option>

          </Select>
        </div>

        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Loại kỳ thi:</label>
          <Select size="small" allowClear
          value={loaiKyThi}
            placeholder="Chọn loại kỳ thi"
            onChange={(value) => setLoaiKyThi(value)}
            className="w-[50%]"
          >
            <Option value="1">Chính thức</Option>
            <Option value="2">Đợt 2</Option>
            <Option value="3">Đợt 3</Option>
            <Option value="4">Đợt 4</Option>
            <Option value="5">Đợt 5</Option>
            <Option value="6">Đợt 6</Option>
            <Option value="7">Đợt 7</Option>
          </Select>
        </div>

        <div className="w-[20%]">
          <Input.Search size="small"
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
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md "
          onClick={() => exportLichThi(dataList, `LỊCH COI THI KẾT THÚC HỌC PHẦN - HỆ`, hocKy, namHoc, loai)}
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
          pageSizeOptions={['10', '25', '50', '100', '200']}
          showSizeChanger
          className="flex justify-end"
        />
      </div>

      <Modal
        title="Danh sách sinh viên"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Table
          bordered
          dataSource={currentList}
          columns={[
            {
              title: 'Họ và Tên',
              dataIndex: 'hoTen',
              key: 'hoTen',
              className: 'font-bold text-red-600'
            },
            {
              title: 'Mã Sinh Viên',
              dataIndex: 'maSV',
              key: 'maSV',
              className: 'font-bold text-blue-600'

            },
            {
              title: 'Lớp',
              dataIndex: 'lop',
              key: 'lop',
              className: 'font-bold text-green-600'

            },
          ]}
          pagination={false}
          rowKey={(record) => record.index}  // Sử dụng index làm khóa
          scroll={{ y: 400 }} // Set the vertical scroll height to 400px
        />
      </Modal>

    </div>
  );
};

export default PcCoiThiTable;
