'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Table, Input, Button, Space, Popconfirm, Spin , Modal, Select} from 'antd';
import { SearchOutlined, EyeFilled, DeleteOutlined ,FileExcelOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ArrowRightOutlined } from '@ant-design/icons';
import { exportToExcelTongHop, exportToExcelTongHopBoiDuong } from '../../../../components/fileExport'
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "next-auth/react";

const App = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 8,
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

  const [namHoc, setNamHoc] = useState("2024-2025");
  const [kiHoc, setKiHoc] = useState("1");

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
        console.log(data);
        setDataList(data.map((item, index) => ({ ...item, index: index + 1 })));
      } else {
        console.log('Failed to fetch data');
      }
    } catch (err) {
      console.log('Error:', err);
    }
    setLoading(false);
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
  }, [namHoc,kiHoc]);

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
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => (
        <Button
          type="link"
          className="text-blue-500 font-bold"
          onClick={() => router.push(`/admin/work-hours/${type}/${currentUser._id}?ki=${kiHoc}&namHoc=${namHoc}`)}
        >
          {record.user.username}
        </Button>
      ),
      className: 'text-blue-500 font-bold text-center',
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
              width:50
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietTH',
              render: (text, record) => record.congTacGiangDay.soTietTH,
              width:50
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
              width:50
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCTH',
              render: (text, record) => record.congTacGiangDay.soTietQCTH,
              width:50
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
      width:50
    },
    {
      title: 'Giờ chuẩn',
      dataIndex: 'gioChuan',
      className: 'text-center',
      width:50
    },
    {
      title: 'Kiêm nhiệm',
      dataIndex: 'kiemNhiem',
      className: 'text-center',
      width:50
    },
    {
      title: 'Chuẩn năm học',
      dataIndex: 'chuanNamHoc',
      className: 'text-center',
      width:50
    },
    {
      title: 'Công tác khác',
      children: [
        {
          title: 'Chấm thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.chamThi',
          render: (text, record) => record.congTacKhac.chamThi,
          width:50
        },
        {
          title: 'Ngoại khóa',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.ngoaiKhoa',
          render: (text, record) => record.congTacKhac.ngoaiKhoa,
          width:50
        },
        {
          title: 'Coi thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.coiThi',
          render: (text, record) => record.congTacKhac.coiThi,
          width:50
        },
        {
          title: 'Đề thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.deThi',
          render: (text, record) => record.congTacKhac.deThi,
          width:50
        },
        {
          title: 'Tổng',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.tong',
          render: (text, record) => record.congTacKhac.tong,
          className: 'text-yellow-500 font-bold',
          width:50

        },
      ],
      className: 'text-center'
    },
    {
      title: 'Tổng giờ chính quy',
      dataIndex: 'tongGioChinhQuy',
      className: 'text-red-500 font-bold text-center',
      width:60
    },
    {
      title: 'Thừa/Thiếu giờ lao động',
      dataIndex: 'thuaThieuGioLaoDong',
      className: 'text-center',
      width:60
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
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
    },
  ];
  const columnChinhQuyKhac = [
    {
      title: 'TT',
      dataIndex: 'index',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => (
        <Button
          type="link"
          className="text-blue-500 font-bold"
          onClick={() => router.push(`/admin/work-hours/${type}/${currentUser._id}?ki=${kiHoc}&namHoc=${namHoc}`)}
        >
          {record.user.username}
        </Button>
      ),
      className: 'text-blue-500 font-bold text-center'
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
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietTH',
              render: (text, record) => record.congTacGiangDay.soTietTH,
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
            },
            {
              title: 'TH',
              dataIndex: 'congTacGiangDay',
              key: 'congTacGiangDay.soTietQCTH',
              render: (text, record) => record.congTacGiangDay.soTietQCTH,
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
      width:70
    },
    {
      title: 'Công tác khác',
      children: [
        {
          title: 'Chấm thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.chamThi',
          render: (text, record) => record.congTacKhac.chamThi,
          width:50
        },
        {
          title: 'Ngoại khóa',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.ngoaiKhoa',
          render: (text, record) => record.congTacKhac.ngoaiKhoa,
          width:50
        },
        {
          title: 'Coi thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.coiThi',
          render: (text, record) => record.congTacKhac.coiThi,
          width:50
        },
        {
          title: 'Đề thi',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.deThi',
          render: (text, record) => record.congTacKhac.deThi,
          width:50
        },
        {
          title: 'Tổng',
          dataIndex: 'congTacKhac',
          key: 'congTacKhac.tong',
          render: (text, record) => record.congTacKhac.tong,
          className: 'text-yellow-500 font-bold',
          width:50
        },
      ],
      className: 'text-center'
    },
    {
      title: 'Tổng giờ chính quy',
      dataIndex: 'tongGioChinhQuy',
      className: 'text-red-500 font-bold text-center',
      width:60
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
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
      width:50
    },
  ];
  const columnBoiDuong = [
    {
      title: 'TT',
      dataIndex: 'index',
      width: '1%',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ và tên giảng viên',
      dataIndex: 'username',
      ...getColumnSearchProps('user.username'),
      render: (text, record) => record.user.username,
      className: 'text-blue-500 font-bold text-center'
    },
    {
      title: 'Chuyên đề giảng dạy',
      dataIndex: 'chuyenDe',
      className: 'text-green-500 font-bold text-center'
    },
    {
      title: 'Lớp giảng dạy',
      dataIndex: 'lopGiangDay',
      className: 'text-center'
    },
    {
      title: 'Số HV',
      dataIndex: 'SoHV',
      className: 'text-center'
    },
    {
      title: 'Số tiết',
      children: [
        {
          title: 'LT',
          dataIndex: 'soTietLT',
        },
        {
          title: 'TH',
          dataIndex: 'soTietTH',
        },
      ],
    },
    {
      title: 'Số tiết quy chuẩn ',
      dataIndex: 'soTietQuyChuan',
      className: 'text-center'
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'soTietQuyChuan',
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
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      className: 'text-center',
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
        toast.success("Record deleted successfully!");
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

  return (
    <div className='p-2 font-bold text-center bg-white rounded-md shadow-md m-auto  my-3'>
      <div className="flex items-center justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mr-2"
          onClick={() => router.push(`/admin/work-hours`)}
        >
          <ArrowLeftOutlined
            style={{
              color: 'white',
              fontSize: '18px',
            }}
          /> QUAY LẠI
        </Button>
        <div className="font-bold text-heading3-bold flex-grow ">
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
      <div className="flex justify-around items-center mb-3">
          <div className="w-[25%] flex items-center gap-2">
            <label className="block text-sm font-semibold mb-1">Năm học:</label>
            <Select
              placeholder="Chọn năm học"
              onChange={(value) => setNamHoc(value)}
              className="w-[50%]"
              value={namHoc}
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
              value={kiHoc}
            >
              <Option value="1">Kỳ 1</Option>
              <Option value="2">Kỳ 2</Option>
            </Select>
          </div>

        </div>

      <Table
        columns={getColumns()}
        rowKey={(record) => record._id}
        dataSource={dataList}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <div className="mt-2 flex justify-center gap-6">
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md mr-2"
          onClick={type !== 'boi-duong' ? () => exportToExcelTongHop(dataList, type, getType()) : () => { exportToExcelTongHopBoiDuong(dataList, getType()) }}
        ><FileExcelOutlined />
          Xuất file Excel
        </Button>
        {/* <Button
          className="button-lien-thong-vlvh-nd71 text-white font-bold shadow-md mr-2"
          onClick={() => { sendEmail() }}
        >
          Gửi email
        </Button> */}
        <CldUploadButton
          className="button-huong-dan rounded-md shadow-md mr-2"
          options={{ maxFiles: 1 }}
          onUpload={uploadPhoto}
          uploadPreset="e0rggou2"
        >
          <p className="text-white text-small-bold px-2">Chọn file gửi Email</p>
        </CldUploadButton>
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
  );
};

export default App;
