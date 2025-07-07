'use client'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useParams } from "next/navigation";
import { Table, Input, Button, Space, Popconfirm, Modal, Select } from 'antd';
import { SearchOutlined, EyeFilled, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { exportToExcelChiTiet, exportTongHopLaoDongDetail } from '../../../../../../lib/fileExport'
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "next-auth/react";
import { getAcademicYearConfig } from '@lib/academicYearUtils';
import toast from "react-hot-toast";

const Pages = () => {
  const { type } = useParams();
  const idDetail = useRef(useParams().id);
  const [dataList, setDataList] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  });
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [fileUrl, setFileUrl] = useState('')

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const [kiHoc, setKiHoc] = useState("1");
  const [khoaOptions, setKhoaOptions] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);


  const { data: session } = useSession();
  const currentUser = session?.user;

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/tong-hop-lao-dong/detail/${idDetail.current}/?type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&kiHoc=${encodeURIComponent(kiHoc)}`, {
          method: "GET", 
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setDataList(data);
          setLoading(false);
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      }
    };

    fetchData();
  }, [namHoc, kiHoc]);

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
  
  const getColumns = () => {
    switch (idDetail.current) {
      case 'CongTacGiangDay':
        return columnsGiangDay;
      case 'CongTacChamThi':
        return columnsChamThi
      case 'CongTacCoiThi':
        return columnsCoiThi
      case 'CongTacHuongDan':
        return columnsHuongDan
      case 'CongTacKiemNhiem':
        return columnsKiemNhiem
      case 'CongTacRaDe':
        return columnsRade
      default:
        return null;
    }
  };
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
      align: 'center',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      align: 'center',
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học phần chấm thi',
      dataIndex: 'hocPhan',
      align: 'center',
      key: 'hocPhan',
      className: ' font-bold'
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
          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
      align: 'center',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Chức vụ, công việc',
      align: 'center',
      dataIndex: 'chucVuCongViec',
      key: 'chucVuCongViec',
      className: ' font-bold'
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
          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center',
      align: 'center',

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
          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
    },
  ];
  const columnsRade = [
    {
      title: 'TT',
      dataIndex: 'index',
      width: '1%',
      align: 'center',

      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      align: 'center',

      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học phần',
      dataIndex: 'hocPhan',
      align: 'center',

      key: 'hocPhan',
      className: ' font-bold'
    },
    {
      title: 'Số TC',
      align: 'center',

      dataIndex: 'soTC',
      key: 'soTC'
    },
    {
      title: 'Lớp học phần',
      align: 'center',

      dataIndex: 'lopHocPhan',
      key: 'lopHocPhan',
      className: 'text-green-500 font-bold'
    },
    // {
    //   title: 'Học kỳ',
    //   align: 'center',

    //   dataIndex: 'hocKy',
    //   key: 'hocKy'
    // },
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
      title: 'Hành động',
      align: 'center',

      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
    },
  ];
  const columnsHuongDan = [
    {
      title: 'TT',
      dataIndex: 'index',
      width: '1%',
      align: 'center',

      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      align: 'center',

      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Nội dung công việc',
      dataIndex: 'noiDungCongViec',
      align: 'center',
      key: 'noiDungCongViec',
      className: ' font-bold'
    },
    {
      title: 'Số SV/Số nhóm',
      align: 'center',
      dataIndex: 'soSVSoNhom',
      key: 'soSVSoNhom'
    },
    {
      title: 'Lớp học phần',
      dataIndex: 'lopHocPhan',
      align: 'center',
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
          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
      render: (text, record) => record.user ? record.user.username : '',
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Học phần',
      dataIndex: 'hocPhan',
      align: 'center',
      key: 'hocPhan',
      className: 'text-red-500 font-bold'
    },
    {
      title: 'Học kỳ',
      align: 'center',
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
      align: 'center',
      dataIndex: 'lopHocPhan',
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
          align: 'center',
          dataIndex: 'soTietLT',
          key: 'soTietLT',
        },
        {
          title: 'TH',
          align: 'center',
          dataIndex: 'soTietTH',
          key: 'soTietTH',
        },
      ],
    },
    {
      title: 'Số tiết QC',
      children: [
        {
          title: 'LT',
          align: 'center',
          dataIndex: 'soTietQCLT',
          key: 'soTietQCLT'
        },
        {
          title: 'TH',
          align: 'center',
          dataIndex: 'soTietQCTH',
          key: 'soTietQCTH'
        },
      ],
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'tongCong',
      align: 'center',
      key: 'tongCong',
      className: 'text-red-500 font-bold text-center',
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

          {/* <Button size='small' onClick={() => handleEdit(record)} type="primary">Sửa</Button> */}
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
  const getTitle1 = () => {
    switch (type) {
      case 'chinh-quy':
        return 'CHÍNH QUY';
      case 'lien-thong-chinh-quy':
        return 'LIÊN THÔNG CHÍNH QUY';
      case 'lien-thong-vlvh':
        return 'LIÊN THÔNG VỪA LÀM VỪA HỌC';
      case 'lien-thong-vhvl-nd71':
        return 'LIÊN THÔNG VỪA LÀM VỪA HỌC - NĐ71';
      default:
        return '';
    }
  };
  const getTitle2 = () => {
    switch (idDetail.current) {
      case 'CongTacGiangDay':
        return 'GIẢNG DẠY';
      case 'CongTacChamThi':
        return 'CHẤM THI';
      case 'CongTacHuongDan':
        return 'HƯỚNG DẪN';
      case 'CongTacCoiThi':
        return 'COI THI';
      case 'CongTacRaDe':
        return 'RA ĐỀ';
      case 'CongTacKiemNhiem':
        return 'KIÊM NHIỆM';
      default:
        return '';
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
              filename: `BẢNG TỔNG HỢP CÔNG TÁC ${getTitle2()} - ${getTitle1()}.xlsx`,
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

  // Sử dụng useMemo để lọc dataList
  const filteredDataList = useMemo(() => {
    if (!selectedKhoa) return dataList;
    return dataList.filter(item => item.user?.khoa === selectedKhoa);
  }, [dataList, selectedKhoa]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/work-hours/${idDetail.current}`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setDataList(prevData => prevData.filter(item => item._id !== id));
        toast.success("Xóa thành công");
      } else {
        toast.error("Failed to delete record");
      }
    } catch (err) {
      toast.error("An error occurred while deleting data");
    }
  };

  return (
    <div className='p-2 font-bold text-center bg-white rounded-md shadow-md w-[98%] m-auto my-3'>
      <div className="flex items-center justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mr-2"
          onClick={() => router.push(`/admin/home/${type}/detail`)}
        >
          <ArrowLeftOutlined
            style={{
              color: 'white',
              fontSize: '18px',
            }}
          /> QUAY LẠI
        </Button>
        <div className="font-bold text-heading3-bold flex-grow text-center">
          {/* {getType()} */}
          {`BẢNG TỔNG HỢP CÔNG TÁC ${getTitle2()} – HỆ ${getTitle1()}`}
        </div>
      </div>
      <div className="flex justify-around items-center mb-3">
        <div className="w-[25%] flex items-center gap-2">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select
            size='small'
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
          <Select
            size='small'
            placeholder="Chọn học kỳ:"
            onChange={(value) => setKiHoc(value)}
            className="w-[50%]"
            value={kiHoc}
          >
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </div>

        <div className="w-[25%] flex items-center gap-2 font-bold">
          <div className="text-base-bold">Khoa:</div>
          <Select size="small"
            className="w-[40%]"
            placeholder="Lọc theo khoa"
            allowClear
            value={selectedKhoa}
            onChange={value => setSelectedKhoa(value)}
          >
            {khoaOptions.map(khoa => (
              <Option key={khoa} value={khoa}>
                {khoa}
              </Option>
            ))}
          </Select>
        </div>

      </div>

      <Table
        columns={getColumns()}
        rowKey={(record) => record._id}
        dataSource={filteredDataList}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <div className="mt-2 flex justify-center gap-6">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md mr-2"
          onClick={() => exportTongHopLaoDongDetail(filteredDataList, idDetail.current, getType(),namHoc, selectedKhoa)}
        ><FileExcelOutlined />
          Xuất file Excel
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
