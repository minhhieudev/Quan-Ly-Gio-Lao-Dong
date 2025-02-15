"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, Radio, InputNumber, Table, Popconfirm, Tabs, Spin, Select } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Loader from "../Loader";
import TablePcGiangDay from "./TablePcGiangDay";
import { PlusOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

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
  const [dataHPTH, setDataHPTH] = useState('');
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
    if (soTietTH && /^\d+\s*giờ$/.test(soTietTH)) {

      const match = soTietTH.match(/(\d+)/); // Tìm số trong chuỗi
      if (match) {
        const numericValue = parseInt(match[0], 10);

        if (currentHocPhan?.diaDiem?.toLowerCase() === "dhpy") {
          const result = (numericValue / 45) * 10
          setValue("soTietQCTH", result);
        }
        else {
          const result = (numericValue / 45) * 15
          setValue("soTietQCTH", result);
        }
      } else {
        console.log("Không tìm thấy giá trị số trong soTietTH");
      }
    }

    else {


      if (currentHocPhan) {

        let result;

        // Tách giá trị từ currentHocPhan.soLuong
        let soLuongValues = [];
        // Tách giá trị từ currentHocPhan.heSo
        let heSoValues = [];
        if (typeof currentHocPhan.record?.heSo === "string" && currentHocPhan.record?.heSo.includes("-")) {

          const cleanedHeSo = currentHocPhan.record.heSo.replace(/[–—]/g, "-").trim();

          ///////////////////////
          heSoValues = cleanedHeSo
            .split("-")
            .map(value => parseFloat(value.trim()))
            .filter(value => !isNaN(value));

          if (typeof currentHocPhan.record?.soLuong === "string" && currentHocPhan.record?.soLuong.includes("-")) {

            const cleanedSoLuong = currentHocPhan.record.soLuong.replace(/[–—]/g, "-").trim();

            soLuongValues = cleanedSoLuong
              .split("-")
              .map(value => parseFloat(value.trim()))
              .filter(value => !isNaN(value));
          } else {
            soLuongValues = [parseFloat(currentHocPhan.record?.soLuong)];
          }
          /////////////////

          // Gán giá trị vào các biến
          const heSoMin = soLuongValues[0] || 1;
          const heSoMax = soLuongValues[1] || heSoMin;

          // Xác định hệ số dựa vào khoảng
          let heSo = 0;
          if (currentHocPhan.soSVDK <= heSoMin) {
            heSo = heSoValues[0];
          } else if (currentHocPhan.soSVDK > heSoMin && currentHocPhan.soSVDK <= heSoMax) {
            heSo = heSoValues[1];
          }
          else {
            heSo = heSoValues[heSoValues.length - 1]
          }

          // Tính toán kết quả
          if (currentHocPhan.tenMH && soTietTH != 0) {
            result = soTietTH * heSo;
          }

          // Cập nhật giá trị
          setValue("soTietQCTH", result);

        } else {

          if (!currentHocPhan.record?.heSo && soTietTH != 0) {
            toast.error("Chưa có dữ liệu TH cho học phần này nên không thể tính số tiết QC!.");
          } else {
            heSoValues = [parseFloat(currentHocPhan.record?.heSo)];
            result = soTietTH * heSoValues[0];
            setValue("soTietQCTH", result);
          }

        }

      }
    }
    if (!currentHocPhan) {
      setValue("soTietQCTH", 0);
    }
  }, [setValue, currentHocPhan, soTietTH, soSVDK],);

  const handleAddNewClick = () => {
    setIsAddingNew(!isAddingNew);
  };

  const handleSaveNewHocPhan = async () => {

    try {
      const res = await fetch(`/api/work-hours/get-hocphan-th/?name=${newHocPhan}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();

        const newHocPhanObj = {
          _id: Math.random().toString(36).substr(2, 9),
          tenMH: newHocPhan,
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

      } else {
        toast.error("Có lỗi khi lấy dữ liệu HPTH !");
      }
    } catch (err) {
      console.log(err)
      toast.error("An error occurred while fetching data HPTH");
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
          setLoading(false)
          setLoadings(false)
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      }
    };

    fetchData();
  }, [namHoc, ky]);

  useEffect(() => {
    if (!namHoc && !ky) return;

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
          //setFilteredData(data);
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
      acc.soTietTH += item.soTietTH || 0;
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
      title: 'Học phần',
      dataIndex: 'hocPhan',
      key: 'hocPhan',
      className: 'text-blue-500 font-bold'
    },
   
    {
      title: 'Số TC',
      dataIndex: 'soTinChi',
      key: 'soTinChi'
    },
    {
      title: 'Lớp học phần',
      dataIndex: 'lopHocPhan',
      key: 'lopHocPhan',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Số SV',
      dataIndex: 'soSV',
      key: 'soSV'
    },
    {
      title: 'Số tiết',
      children: [
        {
          title: 'LT',
          dataIndex: 'soTietLT',
          key: 'soTietLT',
        },
        {
          title: 'TH',
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
          dataIndex: 'soTietQCLT',
          key: 'soTietQCLT'
        },
        {
          title: 'TH',
          dataIndex: 'soTietQCTH',
          key: 'soTietQCTH'
        },
      ],
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'tongCong',
      key: 'tongCong',
      className: 'text-red-500 font-bold text-center'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleEdit(record)} type="primary">Sửa</Button>
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
    <div className="flex gap-2 max-sm:flex-col h-full">
      <div className="px-3 py-1 shadow-xl bg-white rounded-xl flex-[20%]">
        <Title className="text-center" level={5}>CÔNG TÁC GIẢNG DẠY</Title>

        <Form onFinish={handleSubmit(onSubmit)} layout="Inline" className="">
          <Space direction="vertical " size="0" >
            <Form.Item
              label={
                <span className="font-bold text-xl">
                  Mã học phần
                </span>
              }
              className="w-[40%] p-0"
              //validateStatus={errors.maMH ? 'error' : ''}
              help={errors.maMH?.message}
            >
              <Space className="flex">
                <div className="w-[120px]">
                  <Controller
                    name="maMH"
                    control={control}
                    //rules={{ required: "Mã học phần là bắt buộc" }}
                    render={({ field }) => <Input className="input-text w-[90%]" onBlur={(e) => {
                      field.onBlur(); // Gọi hàm mặc định của react-hook-form
                      handleBlur(e.target.value); // Thêm xử lý của bạn khi rời khỏi input
                    }} placeholder="Nhập mã HP ..." {...field} />}
                  />
                </div>

              </Space>
            </Form.Item>
            <Form.Item
              label={
                <span className="font-bold text-xl">
                  Học phần giảng dạy <span className="text-red-600">*</span>
                </span>
              }
              className="w-[40%] p-0"
              validateStatus={errors.hocPhan ? 'error' : ''}
              help={errors.hocPhan?.message}
            >
              <Space className="flex">
                <div className="w-[200px]">
                  <Controller

                    name="hocPhan"
                    control={control}
                    rules={{ required: "Học phần là bắt buộc" }}
                    render={({ field }) => (
                      <Select
                        showSearch

                        allowClear
                        placeholder="Nhập hoặc chọn tên học phần..."
                        {...field}
                        options={listSelect.map(item => ({
                          value: item.tenMH,
                          label: item.tenMH,
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
                  icon={<PlusOutlined />}
                  onClick={handleAddNewClick}
                />
              </Space>
            </Form.Item>
            {isAddingNew && (
              <Form.Item
                label={<span className="font-bold text-xl">Thêm học phần mới</span>}
                className="w-full"
              >
                <Space className="w-full">
                  <Input
                    value={newHocPhan}
                    onChange={(e) => setNewHocPhan(e.target.value)}
                    placeholder="Nhập tên học phần mới..."
                    className="w-[90%]"
                  />
                  <Button type="primary" onClick={handleSaveNewHocPhan}>
                    Lưu
                  </Button>
                </Space>
              </Form.Item>
            )}

            <div className="flex justify-between">
              <Form.Item
                label={<span className="font-bold text-xl">Lớp học phần <span className="text-red-600">*</span></span>}
                validateStatus={errors.lopHocPhan ? 'error' : ''}
                help={errors.lopHocPhan?.message}
              >
                <Controller
                  name="lopHocPhan"
                  control={control}
                  rules={{ required: "Lớp học phần là bắt buộc" }}
                  render={({ field }) => <Input className="input-text w-[90%]" placeholder="Nhập lớp ..." {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Số TC <span className="text-red-600">*</span></span>}
                validateStatus={errors.soTinChi ? 'error' : ''}
                help={errors.soTinChi?.message}
              >
                <Controller
                  name="soTinChi"
                  control={control}
                  rules={{ required: "Số TC là bắt buộc", min: { value: 1, message: "Số TC phải lớn hơn 0" } }}
                  render={({ field }) => <InputNumber className="input-number w-14" {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Số SV <span className="text-red-600">*</span></span>}
                validateStatus={errors.soSV ? 'error' : ''}
                help={errors.soSV?.message}
              >
                <Controller
                  name="soSV"
                  control={control}
                  rules={{ required: "Số SV là bắt buộc", min: { value: 1, message: "Số SV phải lớn hơn 0" } }}
                  render={({ field }) => <InputNumber {...field} className="input-number w-14" />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-between max-sm:flex-col">
              <Form.Item label={<span className="font-bold text-xl">Số tiết</span>} className="w-[40%]">
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex justify-between">
                    <Form.Item
                      label={<span className="font-semibold text-base">LT <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietLT ? 'error' : ''}
                      help={errors.soTietLT?.message}
                    >
                      <Controller
                        name="soTietLT"
                        control={control}
                        rules={{ required: "Số tiết LT là bắt buộc", min: { value: 1, message: "Số tiết phải lớn hơn 0" } }}
                        render={({ field }) => <InputNumber className="input-number w-14" {...field} />}
                      />
                    </Form.Item>

                    <Form.Item
                      className="max-sm:ml-20"
                      label={<span className="font-semibold text-base">TH </span>}
                      validateStatus={errors.soTietTH ? 'error' : ''}
                      help={errors.soTietTH?.message}
                    >
                      <Controller
                        name="soTietTH"
                        control={control}
                        //rules={{ required: "Số tiết TH là bắt buộc", min: { value: 1, message: "Số tiết phải lớn hơn 0" } }}
                        render={({ field }) => <Input className="input-number w-14" {...field} />}
                      />
                    </Form.Item>
                  </div>
                </Space>
              </Form.Item>
              <div className="border-r-4 max-sm:hidden"></div>
              <Form.Item label={<span className="font-bold text-xl">Số tiết quy chuẩn</span>} className="w-[40%]">
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex justify-between">
                    <Form.Item
                      label={<span className="font-semibold text-base">LTQC <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietQCLT ? 'error' : ''}
                      help={errors.soTietQCLT?.message}
                    >
                      <Controller
                        name="soTietQCLT"
                        control={control}
                        rules={{ required: "Số tiết quy chuẩn LT là bắt buộc" }}
                        render={({ field }) => <InputNumber className="input-number w-14" readOnly {...field} />} // Disable input
                      />
                    </Form.Item>
                    <Form.Item
                      className="max-sm:ml-20"
                      label={<span className="font-semibold text-base">THQC <span className="text-red-600">*</span></span>}
                      validateStatus={errors.soTietQCTH ? 'error' : ''}
                      help={errors.soTietQCTH?.message}
                    >
                      <Controller
                        name="soTietQCTH"
                        control={control}
                        render={({ field }) => <InputNumber className="input-number w-14"  {...field} />}
                      />
                    </Form.Item>
                  </div>
                </Space>
              </Form.Item>
            </div>

            <div className="flex justify-between">
              <Form.Item label={<span className="font-bold text-xl">Tổng cộng</span>}>
                <Controller
                  name="tongCong"
                  control={control}
                  render={({ field }) => <InputNumber size="large" className="text-red-700 font-bold" {...field} readOnly />}
                />
              </Form.Item>

              <Form.Item label={<span className="font-bold text-xl">Ghi chú</span>}>
                <Controller
                  name="ghiChu"
                  control={control}
                  render={({ field }) => <Input className="input-text" {...field} />}
                />
              </Form.Item>
            </div>
          </Space>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isSubmitting ? <Spin size="small" /> : "Lưu"}
              </Button>
              <Button type="default" danger onClick={onReset} disabled={isSubmitting}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="p-2 shadow-xl bg-white rounded-xl flex-[70%] text-center">

        <Tabs activeKey={selectedTab} onChange={handleTabChange}>
          <TabPane tab="KẾT QUẢ GIẢNG DẠY" key="Kết quả giảng dạy">
            {loadings ? <Spin size="large" /> :
              <Table
                columns={columns}
                dataSource={dataList}
                rowKey="_id"
                pagination={{ current, pageSize, total: dataList.length, onChange: handleTableChange }}
              />
            }
          </TabPane>
          <TabPane tab="PHÂN CÔNG GIẢNG DẠY" key="Phân công giảng dạy" className="text-center">
            {loadings ? <Spin size="large" /> : <TablePcGiangDay namHoc={namHoc || ''} ky={ky || ''} listSelect={listSelect || []} />}
          </TabPane>
        </Tabs>

      </div>
    </div>
  );
};

export default TeachingForm;


