"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Popconfirm, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../Loader";
import TablePcGiangDay from "./TablePcGiangDay";


const { Title } = Typography;

const formSchema = {
  maMH: '',
  hocPhan: "",
  soTinChi: 0,
  lopHocPhan: "",
  soSV: 0,
  soTietLT: 0,
  soTietTH: 0,
  soTietQCLT: 0,
  soTietQCTH: 0,
  tongCong: 0,
  ghiChu: "",
};

const TeachingForm = ({ onUpdateCongTacGiangDay, namHoc, ky }) => {
  const [dataList, setDataList] = useState([]);
  const [listSelect, setListSelect] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(5);

  const [loading, setLoading] = useState(true);

  const handleTableChange = (pagination) => {
    setCurrent(pagination.current);
  };

  const soTietQCLT = watch("soTietQCLT");
  const soTietQCTH = watch("soTietQCTH");

  const { data: session } = useSession();
  const currentUser = session?.user;

  const { type } = useParams();

  const [selectedTab, setSelectedTab] = useState('Kết quả giảng dạy');
  const [loadings, setLoadings] = useState(true);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newHocPhan, setNewHocPhan] = useState("");

  const soTietLT = watch("soTietLT");
  const soTietTH = watch("soTietTH");
  const soSVDK = watch("soSV");

  const [currentHocPhan, setCurrentHocPhan] = useState(null);


  useEffect(() => {
    if (soTietLT > 0) {
      if (currentHocPhan) {
        let hst = 0
        let hsf = 0
        let hsm = 1;

        if (currentHocPhan.tietBD >= 10 && !['2', '3', '4', '5', '6'].includes(thu)) {
          hst = 0.2;
        }

        // Điều kiện cho soSVDK (Số lượng sinh viên)
        if (currentHocPhan.soSVDK > 80) {
          hsm = 1.5;
        } else if (currentHocPhan.soSVDK > 70) {
          hsm = 1.4;
        } else if (currentHocPhan.soSVDK > 60) {
          hsm = 1.3;
        } else if (currentHocPhan.soSVDK > 50) {
          hsm = 1.2;
        } else if (currentHocPhan.soSVDK > 40) {
          hsm = 1.1;
        }

        if (currentHocPhan.diaDiem && currentHocPhan.diaDiem.toLowerCase() !== 'dhpy') {
          hsf = 0.2;
        }

        const calculatedSoTietQCLT = soTietLT * (hsm + hsf + hst);

        setValue("soTietQCLT", calculatedSoTietQCLT);
      }
    }
    else {
      setValue("soTietQCLT", 0);
    }
  }, [soTietLT, setValue]);

  useEffect(() => {
    // Nếu không có học phần hoặc không có tiết thực hành thì THQC = 0
    if (!currentHocPhan || !soTietTH || isNaN(Number(soTietTH)) || Number(soTietTH) === 0) {
      setValue("soTietQCTH", 0);
      return;
    }

    // Nếu là chuỗi dạng "xx giờ"
    if (typeof soTietTH === "string" && /^\d+\s*giờ$/.test(soTietTH)) {
      const match = soTietTH.match(/(\d+)/);
      if (match) {
        const numericValue = parseInt(match[0], 10);
        if (currentHocPhan?.diaDiem?.toLowerCase() === "dhpy") {
          setValue("soTietQCTH", (numericValue / 45) * 10);
        } else {
          setValue("soTietQCTH", (numericValue / 45) * 15);
        }
      } else {
        setValue("soTietQCTH", 0);
      }
      return;
    }

    // Nếu là số thực hành, thực hiện tính toán hệ số
    let result = 0;
    let heSo = 1;
    if (currentHocPhan && currentHocPhan.record?.heSo) {
      if (typeof currentHocPhan.record.heSo === "string" && currentHocPhan.record.heSo.includes("-")) {
        const heSoValues = currentHocPhan.record.heSo
          .replace(/[–—]/g, "-")
          .split("-")
          .map(v => parseFloat(v.trim()))
          .filter(v => !isNaN(v));
        const soLuongValues = (currentHocPhan.record.soLuong || "")
          .replace(/[–—]/g, "-")
          .split("-")
          .map(v => parseFloat(v.trim()))
          .filter(v => !isNaN(v));
        const heSoMin = soLuongValues[0] || 1;
        const heSoMax = soLuongValues[1] || heSoMin;
        if (currentHocPhan.soSVDK <= heSoMin) {
          heSo = heSoValues[0];
        } else if (currentHocPhan.soSVDK > heSoMin && currentHocPhan.soSVDK <= heSoMax) {
          heSo = heSoValues[1];
        } else {
          heSo = heSoValues[heSoValues.length - 1];
        }
      } else {
        heSo = parseFloat(currentHocPhan.record.heSo) || 1;
      }
    }
    result = Number(soTietTH) * heSo;
    setValue("soTietQCTH", isNaN(result) ? 0 : result);
  }, [setValue, currentHocPhan, soTietTH, soSVDK]);

  // Khi sửa, cập nhật lại currentHocPhan đúng với học phần đang sửa để tính lại THQC
  useEffect(() => {
    if (editRecord) {
      const hp = listSelect.find(item => item.tenMH === editRecord.hocPhan);
      if (hp) setCurrentHocPhan(hp);
    }
  }, [editRecord, listSelect]);

  const handleAddNewClick = () => {
    setIsAddingNew(!isAddingNew);
    // Reset input khi đóng form
    if (isAddingNew) {
      setNewHocPhan("");
    }
  };

  const handleSaveNewHocPhan = async () => {
    const currentMaHP = watch("maMH");

    // Kiểm tra mã học phần từ form
    if (!currentMaHP || currentMaHP.trim() === "") {
      toast.error("Vui lòng nhập mã học phần!");
      return;
    }

    // Kiểm tra tên học phần
    if (!newHocPhan || newHocPhan.trim() === "") {
      toast.error("Vui lòng nhập tên học phần!");
      return;
    }

    try {
      const res = await fetch(`/api/work-hours/get-hocphan-th/?maHP=${encodeURIComponent(currentMaHP)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();

        const newHocPhanObj = {
          _id: Math.random().toString(36).substring(2, 11),
          maMH: currentMaHP.trim(),
          tenMH: newHocPhan.trim(),
          soTC: 0,
          lop: "",
          soSVDK: 0,
          record: data[0]
        };

        // if (data.length < 1) {
        //   toast.error("Lưu ý. Không có dữ liệu thực hành cho học phần này !");
        // }

        // Cập nhật listSelect với học phần mới
        setListSelect([...listSelect, newHocPhanObj]);

        // Reset trạng thái thêm mới và input học phần
        setIsAddingNew(false);
        setNewHocPhan("");

        toast.success("Thêm học phần mới thành công!");

      } else {
        toast.error("Có lỗi khi lấy dữ liệu HPTH !");
      }
    } catch (err) {
      console.log(err)
      toast.error("Có lỗi xảy ra khi lấy dữ liệu HPTH");
    }

  };



  useEffect(() => {
    const tongCong = (soTietQCLT || 0) + (soTietQCTH || 0);
    setValue("tongCong", tongCong);
  }, [soTietQCLT, soTietQCTH, setValue]);



  useEffect(() => {
    if (editRecord) {
      reset(editRecord);
    } else {
      reset(formSchema);
    }
  }, [editRecord, reset]);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/work-hours/CongTacGiangDay/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(ky)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setDataList(data);
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
        setLoadings(false);
      }
    };

    fetchData();
  }, [namHoc, ky, type]);

  useEffect(() => {
    if (!namHoc || !ky || !currentUser?.username) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/giaovu/pc-giang-day/get-for-gv/?namHoc=${namHoc}&ky=${ky}&gvGiangDay=${currentUser.username}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setListSelect(data);
        } else {
          toast.error("Không thể tải dữ liệu");
        }
        setLoading(false);
      } catch (err) {
        console.log('Error:', err);
        toast.error("Lỗi khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchData();
  }, [namHoc, ky]);


  const calculateTotals = () => {
    const totals = dataList.reduce((acc, item) => {
      acc.soTietLT += item.soTietLT || 0;
      acc.soTietTH += parseFloat(item.soTietTH) || 0;
      acc.soTietQCLT += item.soTietQCLT || 0;
      acc.soTietQCTH += item.soTietQCTH || 0;
      acc.tong += item.tongCong || 0;
      return acc;
    }, { soTietLT: 0, soTietTH: 0, soTietQCLT: 0, soTietQCTH: 0, tong: 0 });

    onUpdateCongTacGiangDay(totals);
  };

  useEffect(() => {
    calculateTotals();
  }, [dataList]);

  const onSubmit = async (data) => {
    if (namHoc == '') {
      toast.error('Vui lòng nhập năm học!')
      return
    }
    try {
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch("/api/work-hours/CongTacGiangDay", {
        method,
        body: JSON.stringify({ ...data, type: type, user: currentUser?._id, id: editRecord?._id, namHoc, ky }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newData = await res.json();
        const existingIndex = dataList.findIndex(item => item._id === newData._id);
        if ((editRecord && newData) || (existingIndex !== -1)) {
          setDataList(prevData => prevData.map(item => (item._id === newData._id ? newData : item)));
        } else {
          setDataList(prevData => [...prevData, newData]);
        }
        toast.success("Thêm mới thành công");
        onReset(); // Reset form after success
      } else {
        toast.error("Failed to save record");
      }
    } catch (err) {
      toast.error("An error occurred while saving data");
    }
  };
  const onReset = () => {
    reset(formSchema);
    setEditRecord(null);
    setCurrentHocPhan(null)
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setCurrentHocPhan(null); // Đảm bảo không bị ghi đè bởi useEffect hoặc logic khác
    // Đổ dữ liệu chi tiết vào form, bao gồm cả THQC
    setValue("maMH", record.maMH || "");
    setValue("hocPhan", record.hocPhan || "");
    setValue("soTinChi", record.soTinChi || 0);
    setValue("lopHocPhan", record.lopHocPhan || "");
    setValue("soSV", record.soSV || 0);
    setValue("soTietLT", record.soTietLT || 0);
    setValue("soTietTH", record.soTietTH || 0);
    setValue("soTietQCLT", record.soTietQCLT || 0);
    setValue("soTietQCTH", record.soTietQCTH || 0);
    setValue("tongCong", record.tongCong || 0);
    setValue("ghiChu", record.ghiChu || "");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/work-hours/CongTacGiangDay", {
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

  const handleTabChange = (key) => {
    setLoadings(true);
    setSelectedTab(key);
    setTimeout(() => {
      setLoadings(false);
    }, 500);
  };

  const handleSelectChange = (value) => {
    setEditRecord(null);
    const selectedHocPhan = listSelect.find(item => item.tenMH == value);
    if (selectedHocPhan) {
      setCurrentHocPhan(selectedHocPhan)
      setValue("soTinChi", selectedHocPhan.soTC);
      setValue("lopHocPhan", selectedHocPhan.lop);
      setValue("maMH", selectedHocPhan?.maMH);
      setValue("soSV", selectedHocPhan?.soSVDK);
      if (selectedHocPhan.record?.soTietLT) {
        setValue("soTietLT", selectedHocPhan.record?.soTietLT);
      }
      else {
        setValue("soTietLT", 0);
      }
      if (selectedHocPhan.record?.soTietTH) {
        setValue("soTietTH", selectedHocPhan.record?.soTietTH);
      }
      else {
        setValue("soTietTH", 0);
      }
    }
  };


  const columns = [
    {
      title: <span className="font-semibold">Học phần</span>,
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      className: 'text-blue-600 font-bold',
      render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
      width: '20%',
      ellipsis: true
    },

    {
      title: <span className="font-semibold">Số TC</span>,
      dataIndex: 'soTinChi',
      key: 'soTinChi',
      width: '5%',
      align: 'center'
    },
    {
      title: <span className="font-semibold">Lớp học phần</span>,
      dataIndex: 'lopHocPhan',
      key: 'lopHocPhan',
      className: 'text-green-600',
      render: (text) => <span className="text-green-600 font-medium">{text}</span>,
      width: '15%'
    },
    {
      title: <span className="font-semibold">Số SV</span>,
      dataIndex: 'soSV',
      key: 'soSV',
      width: '5%',
      align: 'center'
    },
    {
      title: <span className="font-semibold">Số tiết</span>,
      children: [
        {
          title: <span className="font-semibold">LT</span>,
          dataIndex: 'soTietLT',
          key: 'soTietLT',
          width: '5%',
          align: 'center'
        },
        {
          title: <span className="font-semibold">TH</span>,
          dataIndex: 'soTietTH',
          key: 'soTietTH',
          width: '5%',
          align: 'center'
        },
      ],
    },
    {
      title: <span className="font-semibold">Số tiết QC</span>,
      children: [
        {
          title: <span className="font-semibold">LT</span>,
          dataIndex: 'soTietQCLT',
          key: 'soTietQCLT',
          width: '5%',
          align: 'center'
        },
        {
          title: <span className="font-semibold">TH</span>,
          dataIndex: 'soTietQCTH',
          key: 'soTietQCTH',
          width: '5%',
          align: 'center'
        },
      ],
    },
    {
      title: <span className="font-semibold">Tổng cộng</span>,
      dataIndex: 'tongCong',
      key: 'tongCong',
      render: (text) => <span className="text-red-600 font-bold">{text}</span>,
      width: '10%',
      align: 'center'
    },
    {
      title: <span className="font-semibold">Ghi chú</span>,
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      width: '15%',
      ellipsis: true,
      render: (text) => text ? <span className="text-gray-700">{text}</span> : null
    },
    {
      title: <span className="font-semibold">Hành động</span>,
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => handleEdit(record)}
            type="primary"
            className="bg-blue-500 hover:bg-blue-600"
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
      align: 'center'
    },
  ];

  const handleBlur = async (value) => {
    if (value.trim() === "") {
    } else {
      setLoading(true)
      try {

        const res = await fetch(`/api/admin/hoc-phan/get-one/?maMH=${encodeURIComponent(maMH)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setValue("soTinChi", data.soTC);
          if (data.soTietLT) {
            setValue("soTietLT", data.soTietLT);
          }
          if (data.soTietTH) {
            setValue("soTietTH", data.soTietTH);
          }
          setLoading(false)
        } else {
          toast.error("Không có thong tin hoc phan");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      }
    }
  };


  return loading ? (
    <Loader />
  ) : (
    <div className="flex gap-2 max-sm:flex-col h-full overflow-hidden">
      <div className="px-5 py-4 shadow-lg bg-white rounded-xl flex-[30%] border border-gray-100 overflow-y-auto">
        <Title className="text-center text-blue-700 mb-4 pb-2 border-b border-gray-200" level={4}>CÔNG TÁC GIẢNG DẠY</Title>

        <Form onFinish={handleSubmit(onSubmit)} layout="Inline" className="px-2">
          <Space direction="vertical" size="small" className="w-full" >
            <Form.Item
              label={
                <span className="font-semibold text-base text-gray-700">
                  Mã học phần
                </span>
              }
              className="w-full mb-0"
              //validateStatus={errors.maMH ? 'error' : ''}
              help={errors.maMH?.message}
            >
              <Space className="flex w-full">
                <div className="w-full max-w-[200px]">
                  <Controller
                    name="maMH"
                    control={control}
                    //rules={{ required: "Mã học phần là bắt buộc" }}
                    render={({ field }) => <Input
                      className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500 shadow-sm"
                      onBlur={(e) => {
                        field.onBlur(); // Gọi hàm mặc định của react-hook-form
                        handleBlur(e.target.value); // Thêm xử lý của bạn khi rời khỏi input
                      }}
                      placeholder="Nhập mã học phần..."
                      {...field}
                    />}
                  />
                </div>

              </Space>
            </Form.Item>
            <Form.Item
              label={
                <span className="font-semibold text-base text-gray-700">
                  Học phần <span className="text-red-600">*</span>
                </span>
              }
              className="w-full mb-0"
              validateStatus={errors.hocPhan ? 'error' : ''}
              help={errors.hocPhan?.message}
            >
              <Space className="flex w-full">
                <div className="flex-1 min-w-0">
                  <Controller
                    name="hocPhan"
                    control={control}
                    rules={{ required: "Học phần là bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        showSearch
                        allowClear
                        className="rounded-md"
                        style={{ width: '170px' }}
                        dropdownStyle={{ width: 'auto', minWidth: '350px' }}
                        listHeight={300}
                        placeholder="Nhập hoặc chọn tên học phần..."
                        {...field}
                        options={listSelect.map(item => ({
                          value: item.tenMH,
                          label: item.tenMH,
                          className: 'text-base py-1'
                        }))}
                        filterOption={(input, option) =>
                          option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          handleSelectChange(value);
                        }}
                      />
                    )}
                  />
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNewClick}
                  className="ml-2 flex-shrink-0"
                />
              </Space>
            </Form.Item>
            {isAddingNew && (
              <Form.Item
                label={<span className="font-semibold text-base text-gray-700">Thêm</span>}
                className="flex w-full mb-0 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
              >
                <Space className="flex w-[100%]">
                  <Input
                    value={newHocPhan}
                    onChange={(e) => setNewHocPhan(e.target.value)}
                    placeholder="Nhập tên học phần mới..."
                    className="min-w-0 rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                  />
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleSaveNewHocPhan}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Lưu
                  </Button>
                </Space>
              </Form.Item>
            )}

            <div className="flex justify-between gap-4 bg-gray-50 p-2 rounded-lg mb-1">
              <Form.Item
                label={<span className="font-semibold text-base text-gray-700">Lớp học phần <span className="text-red-600">*</span></span>}
                validateStatus={errors.lopHocPhan ? 'error' : ''}
                help={errors.lopHocPhan?.message}
                className="flex-1 mb-0"
              >
                <Controller
                  name="lopHocPhan"
                  control={control}
                  rules={{ required: "Lớp học phần là bắt buộc" }}
                  render={({ field }) => <Input
                    className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                    placeholder="Nhập lớp..."
                    {...field}
                  />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-base text-gray-700">Số TC <span className="text-red-600">*</span></span>}
                validateStatus={errors.soTinChi ? 'error' : ''}
                help={errors.soTinChi?.message}
                className="w-24 mb-0"
              >
                <Controller
                  name="soTinChi"
                  control={control}
                  rules={{ required: "Số TC là bắt buộc", min: { value: 1, message: "Số TC phải lớn hơn 0" } }}
                  render={({ field }) => <InputNumber
                    className="w-full rounded-md border-gray-300"
                    {...field}
                  />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-base text-gray-700">Số SV <span className="text-red-600">*</span></span>}
                validateStatus={errors.soSV ? 'error' : ''}
                help={errors.soSV?.message}
                className="w-24 mb-0"
              >
                <Controller
                  name="soSV"
                  control={control}
                  rules={{ required: "Số SV là bắt buộc", min: { value: 1, message: "Số SV phải lớn hơn 0" } }}
                  render={({ field }) => <InputNumber
                    className="w-full rounded-md border-gray-300"
                    {...field}
                  />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-between gap-4 max-sm:flex-col bg-gray-50 p-2 rounded-lg mb-1">
              <div className="flex-1 border-r border-gray-300 pr-4 max-sm:border-r-0 max-sm:border-b max-sm:pb-2">
                <Form.Item label={<span className="font-semibold text-base text-gray-700 block mb-1">Số tiết</span>} className="w-full mb-0">
                  <div className="flex gap-4">
                    <Form.Item
                      label={<span className="font-semibold text-sm text-gray-600">LT <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietLT ? 'error' : ''}
                      help={errors.soTietLT?.message}
                      className="mb-0"
                    >
                      <Controller
                        name="soTietLT"
                        control={control}
                        rules={{ required: "Số tiết LT là bắt buộc", min: { value: 1, message: "Số tiết phải lớn hơn 0" } }}
                        render={({ field }) => <InputNumber
                          className="w-20 rounded-md border-gray-300"
                          {...field}
                        />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-semibold text-sm text-gray-600">TH </span>}
                      validateStatus={errors.soTietTH ? 'error' : ''}
                      help={errors.soTietTH?.message}
                      className="mb-0"
                    >
                      <Controller
                        name="soTietTH"
                        control={control}
                        //rules={{ required: "Số tiết TH là bắt buộc", min: { value: 1, message: "Số tiết phải lớn hơn 0" } }}
                        render={({ field }) => <Input
                          className="w-20 rounded-md border-gray-300"
                          {...field}
                        />}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              </div>

              <div className="flex-1">
                <Form.Item label={<span className="font-semibold text-base text-gray-700 block mb-1">Số tiết quy chuẩn</span>} className="w-full mb-0">
                  <div className="flex gap-6">
                    <Form.Item
                      label={<span className="font-semibold text-sm text-gray-600">LTQC <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietQCLT ? 'error' : ''}
                      help={errors.soTietQCLT?.message}
                      className="mb-0"
                    >
                      <Controller
                        name="soTietQCLT"
                        control={control}
                        rules={{ required: "Số tiết quy chuẩn LT là bắt buộc" }}
                        render={({ field }) => <InputNumber
                          className="w-20 rounded-md border-gray-300 bg-gray-100"
                          {...field}
                        />} // Disable input
                      />
                    </Form.Item>
                    <Form.Item
                      label={<span className="font-semibold text-sm text-gray-600">THQC <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietQCTH ? 'error' : ''}
                      help={errors.soTietQCTH?.message}
                      className="mb-0"
                    >
                      <Controller
                        name="soTietQCTH"
                        control={control}
                        render={({ field }) => <InputNumber
                          className="w-20 rounded-md border-gray-300"
                          {...field}
                        />}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              </div>
            </div>

            <div className="flex justify-between gap-4 mb-2">
              <Form.Item
                label={<span className="font-semibold text-base text-gray-700">Tổng cộng</span>}
                className="w-1/3 mb-0"
              >
                <Controller
                  name="tongCong"
                  control={control}
                  render={({ field }) =>
                    <InputNumber
                      size="large"
                      className="text-red-700 font-bold text-lg w-full rounded-md border-gray-300 bg-red-50"
                      {...field}
                    />
                  }
                />
              </Form.Item>

              <div className="flex-1">
                <div className="mb-1">
                  <span className="font-semibold text-base text-gray-700">Ghi chú</span>
                </div>
                <Controller
                  name="ghiChu"
                  control={control}
                  render={({ field }) =>
                    <Input.TextArea
                      className="w-full rounded-md border-gray-300 hover:border-blue-500 focus:border-blue-500"
                      placeholder="Nhập ghi chú nếu cần..."
                      autoSize={{ minRows: 2, maxRows: 3 }}
                      style={{ resize: 'none' }}
                      {...field}
                    />
                  }
                />
              </div>
            </div>
          </Space>

          <Form.Item className="flex justify-center mt-2">
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 h-8 px-6 font-medium text-base"
              >
                {isSubmitting ? <Spin size="small" /> : "Lưu"}
              </Button>
              <Button
                type="default"
                danger
                onClick={onReset}
                disabled={isSubmitting}
                className="h-8 px-6 font-medium text-base"
              >
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="p-4 shadow-lg bg-white rounded-xl flex-[70%] text-center border border-gray-100 overflow-y-auto">

        <Tabs
          activeKey={selectedTab}
          onChange={handleTabChange}
          type="card"
          className="custom-tabs"
          items={[
            {
              key: 'Kết quả giảng dạy',
              label: <span className="font-semibold text-base">KẾT QUẢ</span>,
              children: loadings ?
                <div className="flex justify-center items-center h-40">
                  <Spin size="large" />
                </div> :
                <Table
                  columns={columns}
                  dataSource={dataList}
                  rowKey="_id"
                  pagination={{
                    current,
                    pageSize,
                    total: dataList.length,
                    onChange: handleTableChange,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20'],
                    showTotal: (total) => `Tổng cộng ${total} bản ghi`
                  }}
                  bordered
                  size="middle"
                  className="custom-table"
                />
            },
            {
              key: 'Phân công giảng dạy',
              label: <span className="font-semibold text-base">PHÂN CÔNG GIẢNG DẠY</span>,
              children: loadings ?
                <div className="flex justify-center items-center h-40">
                  <Spin size="large" />
                </div> :
                <TablePcGiangDay
                  namHoc={namHoc || ''}
                  ky={ky || ''}
                  listSelect={listSelect || []}
                />
            }
          ]}
        />

      </div>
    </div>
  );
};

export default TeachingForm;


