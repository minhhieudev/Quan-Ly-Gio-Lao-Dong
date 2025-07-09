'use client';
import { DeleteOutlined, FileExcelOutlined, SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import toast from "react-hot-toast";

import { exportTongHopLaoDong } from '@lib/fileExport';
import { useSession } from "next-auth/react";
import { getAcademicYearConfig } from '@lib/academicYearUtils';

const App = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const { type } = useParams();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [kiHoc, setKiHoc] = useState("1");
  const [khoaOptions, setKhoaOptions] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");
  // State for updating status
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);

  // Add state for delete modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteYear, setDeleteYear] = useState(namHoc);

  const [currentPageData, setCurrentPageData] = useState([]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(type !== "boi-duong" ?
        `/api/admin/tong-hop-lao-dong/chinh-quy/${type}/?namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(kiHoc)}` :
        `/api/admin/tong-hop-lao-dong/boi-duong/?namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(kiHoc)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setDataList(data.map((item, index) => ({ ...item, index: index + 1 })));
      } else {
        console.log('Failed to fetch data');
      }
    } catch (err) {
      console.log('Error:', err);
    }
    setLoading(false);
  };


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
          subject: 'Tiêu đề email',
          text: contentEmail,
          attachments: [
            {
              filename: `${getType()}.xlsx`,
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


  useEffect(() => {
    fetchData();
  }, [namHoc, kiHoc]);
  useEffect(() => {
    getListKhoa()
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
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

  const columns = [
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
      width: 120, // Giảm width
      ...getColumnSearchProps('user.username'),
      render: (text, record) => (
        <Button
          type="link"
          className="text-blue-500 font-bold"
          onClick={() => router.push(`/admin/home/${type}/${record.user._id}?ki=${kiHoc}&namHoc=${namHoc}`)}
        >
          {record?.user?.username}
        </Button>
      ),
      className: 'text-blue-500 font-bold text-center',
      align: 'center',

    },
    {
      title: 'Công tác giảng dạy chính quy',
      children: [
        {
          title: 'Số tiết',
          children: [
            {
              title: 'LT',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietLT',
              render: (text, record) => record.congTacGiangDay.soTietLT,
              align: 'center',

            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietTH',
              render: (text, record) => record.congTacGiangDay.soTietTH,
              align: 'center',

            },
          ],
        },
        {
          title: 'Số tiết QC',
          children: [
            {
              title: 'LT',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCLT',
              render: (text, record) => record.congTacGiangDay.soTietQCLT,
              align: 'center',

            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCTH',
              render: (text, record) => record.congTacGiangDay.soTietQCTH,
              align: 'center',

            },
          ],
        },
      ],
      className: 'text-center'
    },
    {
      title: 'Tổng giảng dạy',
      dataIndex: 'congTacGiangDay',
      key: 'congTacGiangDay.tong',
      render: (text, record) => record.congTacGiangDay.tong,
      className: 'text-green-500 font-bold text-center',
      align: 'center',

    },
    {
      title: 'Giờ chuẩn',
      dataIndex: 'gioChuan',
      className: 'text-center',
      align: 'center',

    },
    {
      title: 'Kiêm nhiệm',
      dataIndex: 'kiemNhiem',
      className: 'text-center',
      align: 'center',

    },
    {
      title: 'Chuẩn năm học',
      dataIndex: 'chuanNamHoc',
      className: 'text-center',
      align: 'center',
      render: (text, record) => {
        // Đảm bảo giá trị là số, nếu không thì trả về rỗng
        const gioChuan = Number(record.gioChuan) || 0;
        const kiemNhiem = Number(record.kiemNhiem) || 0;
        return gioChuan - kiemNhiem;
      }
    },
    {
      title: 'Công tác khác',
      children: [
        {
          title: 'Chấm thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.chamThi',
          render: (text, record) => record.congTacKhac.chamThi,
          align: 'center',

        },
        {
          title: 'Ngoại khóa',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.ngoaiKhoa',
          render: (text, record) => record.congTacKhac.ngoaiKhoa,
          align: 'center',

        },
        {
          title: 'Coi thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.coiThi',
          render: (text, record) => record.congTacKhac.coiThi,
          align: 'center',

        },
        {
          title: 'Đề thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.deThi',
          render: (text, record) => record.congTacKhac.deThi,
          align: 'center',

        },
        {
          title: 'Tổng',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.tong',
          render: (text, record) => record.congTacKhac.tong,
          className: 'text-yellow-500 font-bold',
          align: 'center',


        },
      ],
      className: 'text-center'
    },
    {
      title: 'Tổng giờ CQ',
      dataIndex: 'tongGioChinhQuy',
      className: 'text-red-500 font-bold text-center',
      align: 'center',
      render: (text, record) => {
        const tongGD = Number(record.congTacGiangDay?.tong) || 0;
        const tongKhac = Number(record.congTacKhac?.tong) || 0;
        return tongGD + tongKhac;
      }
    },
    {
      title: 'Thừa/Thiếu',
      dataIndex: 'thuaThieuGioLaoDong',
      className: 'text-center',
      align: 'center',
      render: (text, record) => {
        const tongGioChinhQuy = Number(record.tongGioChinhQuy) || 0;
        const gioChuan = Number(record.gioChuan) || 0;
        const kiemNhiem = Number(record.kiemNhiem) || 0;
        const chuanNamHoc = gioChuan - kiemNhiem;
        return tongGioChinhQuy - chuanNamHoc;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      className: 'text-center',
      align: 'center',
      render: (value, record) => {
        let color = 'default';
        let text = '';
        switch (value) {
          case 0:
            color = 'orange';
            text = 'Chờ duyệt';
            break;
          case 1:
            color = 'blue';
            text = 'Khoa duyệt';
            break;
          case 2:
            color = 'green';
            text = 'Trường duyệt';
            break;
          case 3:
            color = 'red';
            text = 'Yêu cầu chỉnh sửa';
            break;
          default:
            color = 'default';
            text = 'Không xác định';
        }
        return (
          <Select
            size="small"
            value={typeof value === 'number' ? value : 0}
            style={{ width: 140 }}
            onChange={val => handleUpdateTrangThai(record._id, val)}
            dropdownMatchSelectWidth={false}
            disabled={updatingStatusId === record._id}
            loading={updatingStatusId === record._id}
          >
            <Select.Option value={0}>
              <Tag color="orange">Chờ duyệt</Tag>
            </Select.Option>
            <Select.Option value={1}>
              <Tag color="blue">Khoa duyệt</Tag>
            </Select.Option>
            <Select.Option value={2}>
              <Tag color="green">Trường duyệt</Tag>
            </Select.Option>
            <Select.Option value={3}>
              <Tag color="red">Yêu cầu chỉnh sửa</Tag>
            </Select.Option>
          </Select>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button onClick={() => handleDetail(record._id)} type="primary" icon={<EyeFilled />} /> */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
      width: 5

    },

  ];
  const columnChinhQuyKhac = [
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
      render: (text, record) => (
        <Button
          type="link"
          className="text-blue-500 font-bold"
          onClick={() => router.push(`/admin/home/${type}/${record.user._id}?ki=${kiHoc}&namHoc=${namHoc}`)}
        >
          {record.user.username}
        </Button>
      ),
      className: 'text-blue-500 font-bold text-center',
      align: 'center',

    },
    {
      title: 'Công tác giảng dạy chính quy',
      children: [
        {
          title: 'Số tiết',
          children: [
            {
              title: 'LT',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietLT',
              render: (text, record) => record.congTacGiangDay.soTietLT,
              className: 'text-center',
              align: 'center',
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietTH',
              render: (text, record) => record.congTacGiangDay.soTietTH,
              align: 'center',
            },
          ],
        },
        {
          title: 'Số tiết QC',
          children: [
            {
              title: 'LT',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCLT',
              render: (text, record) => record.congTacGiangDay.soTietQCLT,
              className: 'text-center'
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCTH',
              render: (text, record) => record.congTacGiangDay.soTietQCTH,
              align: 'center',
            },
          ],
        },
      ],
      className: 'text-center',
    },
    {
      title: 'Tổng giảng dạy',
      dataIndex: 'congTacGiangDay',
      key: 'congTacGiangDay.tong',
      render: (text, record) => record.congTacGiangDay.tong,
      className: 'text-green-500 font-bold text-center',
      align: 'center',
    },
    {
      title: 'Công tác khác',

      children: [
        {
          title: 'Chấm thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.chamThi',
          render: (text, record) => record.congTacKhac.chamThi,
          align: 'center',
        },
        {
          title: 'Ngoại khóa',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.ngoaiKhoa',
          render: (text, record) => record.congTacKhac.ngoaiKhoa,
          align: 'center',
        },
        {
          title: 'Coi thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.coiThi',
          render: (text, record) => record.congTacKhac.coiThi,
          align: 'center',
        },
        {
          title: 'Đề thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.deThi',
          render: (text, record) => record.congTacKhac.deThi,
          align: 'center',
        },
        {
          title: 'Tổng',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.tong',
          render: (text, record) => record.congTacKhac.tong,
          className: 'text-yellow-500 font-bold text-center',
          align: 'center',
        },
      ],
      className: 'text-center'
    },
    {
      title: 'Tổng giờ chính quy',
      dataIndex: 'tongGioChinhQuy',
      className: 'text-red-500 font-bold text-center',
      align: 'center',

    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button onClick={() => handleDetail(record._id)} type="primary" icon={<EyeFilled />} /> */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
      align: 'center',
      width: 5
    },
  ];
  const columnBoiDuong = [
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
      title: 'Chuyên đề giảng dạy',
      dataIndex: 'chuyenDe',
      align: 'center',
      className: 'text-green-500 font-bold text-center'
    },
    {
      title: 'Lớp giảng dạy',
      dataIndex: 'lopGiangDay',
      align: 'center',
      className: 'text-center'
    },
    {
      title: 'Số HV',
      dataIndex: 'SoHV',
      align: 'center',
      className: 'text-center'
    },
    {
      title: 'Số tiết',
      children: [
        {
          title: 'LT',
          dataIndex: 'soTietLT',
          align: 'center',
        },
        {
          title: 'TH',
          dataIndex: 'soTietTH',
          align: 'center',
        },
      ],
    },
    {
      title: 'Số tiết quy chuẩn ',
      dataIndex: 'soTietQuyChuan',
      align: 'center',
      className: 'text-center'
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'soTietQuyChuan',
      align: 'center',
      className: 'text-center'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button onClick={() => handleDetail(record._id)} type="primary" icon={<EyeFilled />} /> */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size='small' type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
      align: 'center',

    },
  ];

  const handleDelete = async (id) => {
    try {
      const res = await fetch(type !== "boi-duong" ? `/api/work-hours/tong-hop-lao-dong/chinh-quy` : "/api/work-hours/tong-hop-lao-dong/boi-duong", {
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

  const handleDetail = async (id) => {
    router.push(`/${id}`);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
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
  const getColumns = () => {
    switch (type) {
      case 'chinh-quy':
        return columns;
      case 'boi-duong':
        return columnBoiDuong
      default:
        return columnChinhQuyKhac;
    }
  };

  const uploadPhoto = async (result) => {
    const url = result?.info?.secure_url;
    setFileUrl(url);
    await sendEmail();
  };

  // Tạo filteredDataList để lọc từ dataList
  const filteredDataList = useMemo(() => {
    if (!selectedKhoa) return dataList;
    return dataList.filter(item => item.user?.khoa === selectedKhoa);
  }, [dataList, selectedKhoa]);

  const handleUpdateTrangThai = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch('/api/admin/tong-hop-lao-dong/update-status', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangThai: newStatus }),
      });
      if (res.ok) {
        setDataList(prev =>
          prev.map(item =>
            item._id === id ? { ...item, trangThai: newStatus } : item
          )
        );
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Add function to handle bulk delete by school year
  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/tong-hop-lao-dong/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namHoc: deleteYear,
          loai: type
        })
      });

      if (res.ok) {
        toast.success("Xóa dữ liệu thành công");
        setIsDeleteModalVisible(false);
        fetchData(); // Refresh data after deletion
      } else {
        const data = await res.json();
        toast.error(data.message || "Không thể xóa dữ liệu");
      }
    } catch (err) {
      console.error("Error bulk deleting records:", err);
      toast.error("Lỗi khi xóa dữ liệu");
    } finally {
      setIsDeleting(false);
    }
  };

  // Khai báo pageData trước return
  const { current = 1, pageSize = 5 } = tableParams.pagination || {};
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const pageData = currentPageData.length > 0
    ? currentPageData
    : filteredDataList.slice(start, end);

  return (
    <div className='p-2 font-bold text-center bg-white rounded-md shadow-md m-auto my-3'>
      <div className="flex items-center justify-center mb-0">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mr-2"
          onClick={() => router.push(`/admin/home`)}
        >
          <ArrowLeftOutlined
            style={{
              color: 'white',
              fontSize: '18px',
            }}
          /> QUAY LẠI
        </Button>
        <div className="font-bold text-base-bold flex-grow ">
          {getType()}
        </div>
        {type !== 'boi-duong' && (
          <Button
            className="button-ra-de-thi text-white font-bold shadow-md mr-2"
            onClick={() => router.push(`./${type}/detail`)}
          >
            XEM CHI TIẾT<ArrowRightOutlined
              style={{
                color: 'white',
                fontSize: '18px',
              }}
            />
          </Button>
        )}
      </div>
      <div className="flex justify-around items-center mb-3 mt-2">
        <div className="w-[25%] flex items-center gap-2 font-bold">
          <label className="block text-sm font-semibold mb-1">Năm học:</label>
          <Select size='small' allowClear
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
        <div className='text-small-bold mr-4'>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-green-100 rounded p-1 font-semibold">
              Đã duyệt: {filteredDataList.filter(item => item.trangThai == 2).length}
            </div>
            <div className="bg-orange-100 rounded p-1 font-semibold">
              Chờ duyệt: {filteredDataList.filter(item => item.trangThai == 0).length}
            </div>
            <div className="bg-blue-100 rounded p-1 font-semibold">
              Khoa duyệt: {filteredDataList.filter(item => item.trangThai == 1).length}
            </div>
            <div className="bg-red-100 rounded p-1 font-semibold">
              Yêu cầu chỉnh sửa: {filteredDataList.filter(item => item.trangThai == 3).length}
            </div>
          </div>
        </div>

        {/* <div className="w-[25%] flex items-center gap-2 font-bold">
          <label className="block text-sm font-semibold mb-1">Học kỳ:</label>
          <Select size='small'
            placeholder="Chọn học kỳ:"
            onChange={(value) => setKiHoc(value)}
            className="w-[50%]"
            value={kiHoc}
          >
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </div> */}

      </div>

      <Table
        className="text-xs" // Giảm cỡ chữ
        bordered
        columns={getColumns()}
        rowKey={(record) => record._id}
        dataSource={filteredDataList}
        pagination={{
          ...tableParams.pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '50', '100', '500'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
        }}
        loading={loading}
        scroll={{ x: 'max-content' }}
        onChange={(pagination, filters, sorter, extra) => {
          setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
          });
          setCurrentPageData(extra.currentDataSource);
        }}
      />

      <div className="mt-0 flex justify-center gap-6">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md mr-2"
          onClick={() => exportTongHopLaoDong(filteredDataList, type, getType(), namHoc, selectedKhoa)}
        >
          <FileExcelOutlined />
          Xuất file Excel
        </Button>
        
        {/* Add Delete Button */}
        <Button
          className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-md mr-2"
          onClick={() => setIsDeleteModalVisible(true)}
        >
          <DeleteOutlined />
          Xóa theo năm học
        </Button>
      </div>

      {/* Add Delete Modal */}
      <Modal
        title="Xóa dữ liệu theo năm học"
        visible={isDeleteModalVisible}
        onOk={handleBulkDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        confirmLoading={isDeleting}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-4 font-semibold">Bạn có chắc chắn muốn xóa tất cả dữ liệu của năm học đã chọn?</p>
        <div className="flex items-center gap-2">
          <span>Chọn năm học:</span>
          <Select
            value={deleteYear}
            onChange={(value) => setDeleteYear(value)}
            style={{ width: 150 }}
          >
            {namHocOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </div>
        <p className="mt-4 text-red-500">Lưu ý: Hành động này không thể hoàn tác!</p>
      </Modal>

      <Modal
        title="Thông Báo"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>ĐÃ GỬI EMAIL ĐÍNH KÈM FILE ĐẾN TẤT CẢ GIẢNG VIÊN</p>
      </Modal>
    </div>
  );
};

export default App;
