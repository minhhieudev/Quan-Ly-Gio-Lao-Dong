'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from "next/navigation";
import { Table, Input, Button, Space, Popconfirm, Modal } from 'antd';
import { SearchOutlined, EyeFilled, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { exportTongHopLaoDongForUser } from '../../../../../lib/fileExport'
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useSearchParams } from 'next/navigation'

const Pages = () => {
  const { type, UserID } = useParams();
  const [dataList, setDataList] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [fileUrl, setFileUrl] = useState('')

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [activeKey, setActiveKey] = useState('Công tác giảng dạy');
  const [tenGV, setTenGV] = useState('');
  const [columns, setColumns] = useState([]);
  const [loai, setLoai] = useState('CongTacGiangDay');

  // Sử dụng useSearchParams để lấy các tham số truy vấn từ URL
  const searchParams = useSearchParams();
  const ki = searchParams.get('ki');
  const namHoc = searchParams.get('namHoc');
  // Thêm state mới để lưu trữ dữ liệu tổng hợp
  const [allData, setAllData] = useState({
    info: null,
    data: {
      CongTacGiangDay: [],
      CongTacChamThi: [],
      CongTacCoiThi: [],
      CongTacHuongDan: [],
      CongTacKiemNhiem: [],
      CongTacRaDe: []
    }
  });

  // Thêm state mới để quản lý trạng thái loading của nút xuất Excel
  const [exportLoading, setExportLoading] = useState(false);

  const fetchAllData = async () => {
    setExportLoading(true); // Bắt đầu loading
    try {
      const res = await fetch(`/api/admin/tong-hop-lao-dong/get-all/?user=${encodeURIComponent(UserID)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(ki)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Data', data)
        setAllData(data);
        if (allData){
          exportTongHopLaoDongForUser(allData, 'Kỹ thuật công nghệ', namHoc)
        }
        toast.success("Xuất Excel thành công!");
      } else {
        toast.error("Không thể xuất Excel. Vui lòng thử lại!");
      }
    } catch (err) {
      console.log(err)
      toast.error("Đã xảy ra lỗi khi xuất Excel");
    } finally {
      setExportLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      if (loai === "") return;
      setLoading(true);

      try {
        const res = await fetch(`/api/work-hours/${loai}/?user=${encodeURIComponent(UserID)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(ki)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setDataList(data);
            setTenGV(data[0].user.username)
          }
          else {
            setDataList([])
          }
          setLoading(false);
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      }
    };

    fetchData();
  }, [ki, namHoc, loai]);

  useEffect(() => {
    setColumns(columnsGiangDay);
  }, [])

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  const columnsChamThi = [
    {
      title: 'TT',
      dataIndex: 'index',
      width: '1%',
      render: (text, record, index) => index + 1,
      align: 'center',

    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center',
      align: 'center',

    },
    {
      title: 'Học phần chấm thi',
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      className: 'text-blue-500 font-bold',
      align: 'center',

    },
    {
      title: 'Lớp học phần',
      align: 'center',
      dataIndex: 'lopHocPhan',
      key: 'lopHocPhan'
    },
    {
      title: 'Học kỳ',
      align: 'center',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Cán bộ chấm thi',
      align: 'center',
      dataIndex: 'canBoChamThi',
      key: 'canBoChamThi'
    },
    {
      title: 'Số bài chấm',
      align: 'center',
      dataIndex: 'soBaiCham',
      key: 'soBaiCham'
    },
    {
      title: 'Số tiết quy chuẩn',
      align: 'center',
      dataIndex: 'soTietQuyChuan',
      key: 'soTietQuyChuan',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Ghi chú',
      align: 'center',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: '3%',
    },
  ];
  const columnsKiemNhiem = [
    {
      title: 'TT',
      dataIndex: 'index',
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      align: 'center',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Chức vụ, công việc',
      dataIndex: 'chucVuCongViec',
      align: 'center',
      key: 'chucVuCongViec',
      className: ' font-bold'
    },
    {
      title: 'Học kỳ',
      align: 'center',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Thời gian tính',
      align: 'center',
      dataIndex: 'thoiGianTinh',
      key: 'thoiGianTinh'
    },
    {
      title: 'Tỷ lệ % miễn giảm',
      align: 'center',
      dataIndex: 'tyLeMienGiam',
      key: 'tyLeMienGiam'
    },
    {
      title: 'Số tiết quy chuẩn',
      align: 'center',
      dataIndex: 'soTietQC',
      key: 'soTietQC',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Ghi chú',
      align: 'center',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5
    },
  ];
  const columnsCoiThi = [
    {
      title: 'TT',
      dataIndex: 'index',
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      align: 'center',
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học kỳ',
      align: 'center',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Số tiết quy chuẩn',
      align: 'center',
      dataIndex: 'soTietQuyChuan',
      key: 'soTietQuyChuan'
    },
    {
      title: 'Ghi chú',
      align: 'center',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      title: 'Học phần',
      align: 'center',
      dataIndex: 'hocPhan',
      key: 'hocPhan'
    },
    {
      title: 'Thời gian thi',
      align: 'center',
      dataIndex: 'thoiGianThi',
      key: 'thoiGianThi'
    },
    {
      title: 'Ngày thi',
      align: 'center',
      dataIndex: 'ngayThi',
      key: 'ngayThi',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5
    },
  ];
  const columnsRade = [
    {
      title: 'TT',
      dataIndex: 'index',
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      align: 'center',
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học phần',
      dataIndex: 'hocPhan',
      align: 'center',
      key: 'hocPhan',
      className: 'font-bold'
    },
    {
      title: 'Số TC',
      align: 'center',
      dataIndex: 'soTC',
      key: 'soTC'
    },
    {
      title: 'Lớp học phần',
      dataIndex: 'lopHocPhan',
      align: 'center',
      key: 'lopHocPhan',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Học kỳ',
      align: 'center',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Hình thức thi',
      align: 'center',
      dataIndex: 'hinhThucThi',
      key: 'hinhThucThi'
    },
    {
      title: 'Thời gian thi',
      align: 'center',
      dataIndex: 'thoiGianThi',
      key: 'thoiGianThi'
    },
    {
      title: 'Số tiết quy chuẩn',
      align: 'center',
      dataIndex: 'soTietQuyChuan',
      key: 'soTietQuyChuan',
      className: 'text-red-500 font-bold'
    },
    {
      title: 'Ghi chú',
      align: 'center',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5
    },
  ];
  const columnsHuongDan = [
    {
      title: 'TT',
      dataIndex: 'index',
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      align: 'center',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học kỳ',
      align: 'center',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Nội dung công việc',
      align: 'center',
      dataIndex: 'noiDungCongViec',
      key: 'noiDungCongViec',
      className: 'text-blue-500 font-bold'
    },
    {
      align: 'center',
      title: 'Số SV/Số nhóm',
      dataIndex: 'soSVSoNhom',
      key: 'soSVSoNhom'
    },
    {
      title: 'Lớp học phần',
      align: 'center',
      dataIndex: 'lopHocPhan',
      key: 'lopHocPhan',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Thời gian',
      align: 'center',
      dataIndex: 'thoiGian',
      key: 'thoiGian'
    },
    {
      title: 'Số buổi',
      align: 'center',
      dataIndex: 'soBuoi',
      key: 'soBuoi'
    },
    {
      title: 'Số tiết quy chuẩn',
      dataIndex: 'soTietQuyChuan',
      align: 'center',
      key: 'soTietQuyChuan',
      className: 'text-red-500 font-bold'
    },
    // {
    //     title: 'Tổng cộng',
    //     dataIndex: 'tongCong',
    //     key: 'tongCong',
    //     className: 'text-red-500 font-bold'
    // },
    {
      align: 'center',
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5
    },
  ];
  const columnsGiangDay = [
    {
      title: 'TT',
      dataIndex: 'index',
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      align: 'center',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học phần',
      dataIndex: 'hocPhan',
      align: 'center',
      key: 'hocPhan',
      className: 'text-black-500 font-bold'
    },
    {
      align: 'center',
      title: 'Học kỳ',
      dataIndex: 'ky',
      key: 'ky'
    },
    {
      title: 'Số TC',
      align: 'center',
      dataIndex: 'soTinChi',
      key: 'soTinChi'
    },
    {
      title: 'Lớp học phần',
      dataIndex: 'lopHocPhan',
      align: 'center',
      key: 'lopHocPhan',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Số SV',
      align: 'center',
      dataIndex: 'soSV',
      key: 'soSV'
    },
    {
      title: 'Số tiết',
      children: [
        {
          title: 'LT',
          dataIndex: 'soTietLT',
          align: 'center',
          key: 'soTietLT',
        },
        {
          title: 'TH',
          dataIndex: 'soTietTH',
          align: 'center',
          key: 'soTietTH',
        },
      ],
    },
    {
      title: 'Số tiết QC',
      children: [
        {
          align: 'center',
          title: 'LT',
          dataIndex: 'soTietQCLT',
          key: 'soTietQCLT'
        },
        {
          align: 'center',
          title: 'TH',
          dataIndex: 'soTietQCTH',
          key: 'soTietQCTH'
        },
      ],
    },
    {
      align: 'center',
      title: 'Tổng cộng',
      dataIndex: 'tongCong',
      key: 'tongCong',
      className: 'text-red-500 font-bold text-center',
    },
    {
      align: 'center',
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      align: 'center',
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setDataList([]);
    }
  };
  const getType = () => {
    switch (type) {
      case 'chinh-quy':
        return 'BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ CHÍNH QUY'
      case 'lien-thong-chinh-quy':
        return 'BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ LIÊN THÔNG CHÍNH QUY'
      case 'lien-thong-vlvh':
        return 'BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ LIÊN THÔNG VỪA LÀM VỪA HỌC'
      case 'lien-thong-vlvh-nd71':
        return 'BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN – HỆ LIÊN THÔNG VỪA LÀM VỪA HỌC - NĐ71'
      case 'boi-duong':
        return 'BẢNG TỔNG HỢP CÔNG TÁC GIẢNG DẠY - BỒI DƯỠNG'
      default:
        return null;
    }
  };
  const contentEmail = `
  Kính gửi Quý Thầy / Cô,

  Trường Đại học Phú Yên xin gửi tới Quý Thầy / Cô thông báo về bảng tổng hợp lao động giảng viên của trường.
  Trong bảng tổng hợp này, Quý Thầy / Cô sẽ thấy các thông tin chi tiết về công tác giảng dạy, công tác khác, và tổng số giờ lao động.Xin vui lòng kiểm tra kỹ lưỡng và phản hồi nếu có bất kỳ thắc mắc hay điều chỉnh nào cần thiết.

  Bảng tổng hợp lao động này bao gồm:
  1. Thông tin chi tiết về công tác giảng dạy chính quy.
  2. Thông tin về các công tác khác như chấm thi, coi thi, ngoại khóa, và đề thi.
  3. Tổng số giờ lao động và sự cân đối về giờ lao động.

  Quý Thầy / Cô có thể tải xuống bảng tổng hợp lao động từ tệp đính kèm trong email này.

  Nếu có bất kỳ câu hỏi hay cần thêm thông tin, xin vui lòng liên hệ với Phòng Hành chính - Nhân sự qua email hoặc số điện thoại dưới đây.

  Trân trọng,
  Nguyễn Văn B
  Phòng Hành chính - Nhân sự
  Trường Đại học Phú Yên
  email @example.com
  0123 456 789
  `
  const sendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: currentUser._id,
          subject: 'Thông báo về Bảng tổng hợp lao động giảng viên',
          text: contentEmail,
          attachments: [
            {
              filename: `BẢNG TỔNG HỢP LAO ĐỘNG GIẢNG VIÊN - ${getType()}.xlsx`,
              path: fileUrl, // Đảm bảo rằng fileUrl là đường dẫn hợp lệ
              contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
          ]
        })
      });

      if (res.ok) {
        setIsModalVisible(true);
        setLoading(false);
      } else {
        console.log('Lỗi');
      }
    } catch (err) {
      console.log(err);
    }
  }
  const uploadPhoto = async (result) => {
    const url = result?.info?.secure_url;
    setFileUrl(url);
    await sendEmail();
  };
  const getButtonList = () => {
    switch (type) {
      case 'boi-duong':
        return ['Công tác giảng dạy bồi dưỡng'];
      case 'chinh-quy':
        return [
          'Công tác giảng dạy',
          'Công tác chấm thi',
          'Công tác hướng dẫn',
          'Công tác coi thi',
          'Công tác ra đề thi',
          'Công tác kiêm nhiệm'
        ];
      default:
        return [
          'Công tác giảng dạy',
          'Công tác chấm thi',
          'Công tác hướng dẫn',
          'Công tác coi thi',
          'Công tác ra đề thi'
        ];
    }
  };
  const getButtonClass = (buttonText) => {
    switch (buttonText) {
      case 'Công tác giảng dạy':
        return 'button-dang-day';
      case 'Công tác chấm thi':
        return 'button-cham-thi';
      case 'Công tác hướng dẫn':
        return 'button-huong-dan';
      case 'Công tác coi thi':
        return 'button-coi-thi';
      case 'Công tác ra đề thi':
        return 'button-ra-de-thi';
      case 'Công tác kiêm nhiệm':
        return 'button-kiem-nhiem';
      case 'Công tác giảng dạy bồi dưỡng':
        return 'button-boi-duong';
      default:
        return '';
    }
  };
  const handleButtonClick = (key, formType) => {
    setActiveKey(key);
    switch (formType) {
      case 'Công tác giảng dạy':
        setColumns(columnsGiangDay)
        setLoai('CongTacGiangDay');
        break
      case 'Công tác chấm thi':
        setColumns(columnsChamThi)
        setLoai('CongTacChamThi');
        break
      case 'Công tác coi thi':
        setColumns(columnsCoiThi)
        setLoai('CongTacCoiThi');
        break
      case 'Công tác hướng dẫn':
        setColumns(columnsHuongDan)
        setLoai('CongTacHuongDan');
        break
      case 'Công tác kiêm nhiệm':
        setColumns(columnsKiemNhiem)
        setLoai('CongTacKiemNhiem');
        break
      case 'Công tác ra đề thi':
        setColumns(columnsRade)
        setLoai('CongTacRaDe');
        break
      default:
        return null;
    }
  };

  return (
    <div className='p-2 font-bold text-center bg-white rounded-md shadow-md w-[98%] m-auto my-3'>
      <div className="">
        {/* <div className='text-heading3-bold text-green-500'>{`BẢNG KÊ KHAI LAO ĐỘNG GIẢNG VIÊN - ${gv}`}</div> */}
        <div className="flex items-center justify-center mb-3">
          <Button
            className="button-kiem-nhiem text-white font-bold shadow-md mr-2"
            onClick={() => router.push(`/admin/work-hours/${type}`)}
          >
            <ArrowLeftOutlined
              style={{
                color: 'white',
                fontSize: '18px',
              }}
            /> QUAY LẠI
          </Button>
          <div className='text-base-bold flex-grow'>{`BẢNG KÊ KHAI LAO ĐỘNG GIẢNG VIÊN - ${tenGV?.toUpperCase()}`} </div>
        </div>
        <div className="flex space-x-4 justify-around items-center max-sm:flex-col max-sm:gap-4 mt-2 mb-2">
          {getButtonList().map((buttonText) => (
            <Button
              key={buttonText}
              className={`custom-button ${getButtonClass(buttonText)} ${activeKey === buttonText ? 'custom-button-active' : ''}`}
              onClick={() => handleButtonClick(buttonText, buttonText)}
            >
              {buttonText}
            </Button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        rowKey={(record) => record._id}
        dataSource={dataList}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <div className="mt-2 flex justify-center gap-6">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md mr-2"
          onClick={() => fetchAllData()}
          loading={exportLoading}
          disabled={exportLoading}
        >
          {!exportLoading && <FileExcelOutlined />}
          {exportLoading ? 'Đang xuất Excel...' : 'Xuất file Excel'}
        </Button>
        {/* <CldUploadButton
          className="button-huong-dan rounded-md shadow-md mr-2"
          options={{ maxFiles: 1 }}
          onUpload={uploadPhoto}
          uploadPreset="e0rggou2"
        >
          <p className="text-white text-small-bold px-2">Chọn file gửi Email</p>
        </CldUploadButton> */}
      </div>
      <Modal
        title="Thông Báo"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>ĐÃ GỬI EMAIL ĐÍNH KÈM FILE ĐẾN TẤT CẢ GIẢNG VIÊN</p>
      </Modal>
    </div>
  )
}

export default Pages
