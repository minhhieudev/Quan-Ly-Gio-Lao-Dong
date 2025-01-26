"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Space, Typography, InputNumber, Table, Popconfirm, Spin } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Loader from "./Loader";

const { Title } = Typography;

const formSchema = {
  chuyenDe: "",
  loaiHinh: "",
  thoiGian: "",
  soHV: 0,
  soTietLT: 0,
  soTietTH: 0,
  soTietQuyChuan: 0,
  lopGiangDay: '',
  ghiChu: "",
};

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const TrainingTypeForm = ({ namHoc, ky }) => {
  const [dataList, setDataList] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(6);
  const router = useRouter();
  const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const soTietLT = watch("soTietLT");
  const soTietTH = watch("soTietTH");

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const soTietQuyChuan = (soTietLT || 0) + (soTietTH || 0);
    setValue("soTietQuyChuan", soTietQuyChuan);
  }, [soTietLT, soTietTH, setValue]);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/work-hours/BoiDuong/?user=${encodeURIComponent(currentUser._id)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setDataList(data);
          setLoading(false)
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      }
    };

    fetchData();
  }, [currentUser]);

  const onSubmit = async (data) => {
    if (namHoc == '') {
      toast.error('Vui lòng nhập năm học!')
      return
    }
    try {
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch("/api/work-hours/BoiDuong", {
        method,
        body: JSON.stringify({ ...data, user: currentUser._id, id: editRecord?._id, namHoc, ky }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newData = await res.json();
        if (editRecord && newData) {
          setDataList(prevData => prevData.map(item => (item._id === newData._id ? newData : item)));
        } else {
          setDataList(prevData => [...prevData, newData]);
        }
        toast.success("Lưu thành công");
        onReset();
      } else {
        toast.error("Lưu thất bại !");
      }
    } catch (err) {
      toast.error("An error occurred while saving data");
    }
  };
  const onReset = () => {
    reset(formSchema);
    setEditRecord(null);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    reset(record);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/work-hours/BoiDuong", {
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

  const columns = [
    {
      title: 'Chuyên đề giảng dạy',
      dataIndex: 'chuyenDe',
      key: 'chuyenDe',
      align: 'center',
      className: 'text-blue-500 font-bold'
    },
    {
      title: 'Loại hình bồi dưỡng',
      dataIndex: 'loaiHinh',
      key: 'loaiHinh',
      align: 'center',
      className: 'text-green-500 font-bold'
    },
    {
      title: 'Thời gian',
      dataIndex: 'thoiGian',
      align: 'center',
      key: 'thoiGian'
    },
    {
      title: 'Số HV',
      dataIndex: 'soHV',
      align: 'center',
      key: 'soHV'
    },
    {
      title: 'Số tiết',
      children: [
        {
          title: 'LT',
          dataIndex: 'soTietLT',
          key: 'soTietLT',
          align: 'center',

        },
        {
          title: 'TH',
          dataIndex: 'soTietTH',
          key: 'soTietTH',
          align: 'center',

        },
      ],
    },
    {
      title: 'Số tiết quy chuẩn',
      dataIndex: 'soTietQuyChuan',
      key: 'soTietQuyChuan',
      align: 'center',

      className: 'text-red-500 font-bold text-center'
    },
    {
      title: 'Lớp giảng dạy',
      dataIndex: 'lopGiangDay',
      key: 'lopGiangDay',
      align: 'center',

      className: 'text-purple-500 font-bold'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      align: 'center',

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
            <Button size= 'small' type="primary" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 5,
      align: 'center',


    },
  ];

  const handleTableChange = (pagination) => {
    setCurrent(pagination.current);
  };

  const totalSoTietQuyChuan = useMemo(() => {
    return dataList.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
  }, [dataList]);

  return loading ? (
    <Loader />
  ) : (
    <div className="flex gap-3 max-sm:flex-col">
      <div className="p-5 shadow-xl bg-white rounded-xl flex-[30%]">
        <Title className="text-center" level={3}>CÔNG TÁC LOẠI HÌNH BỒI DƯỠNG</Title>

        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-8 mt-10">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Form.Item
                label={<span className="font-bold text-xl">Chuyên đề giảng dạy <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.chuyenDe ? 'error' : ''}
                help={errors.chuyenDe?.message}
              >
                <Controller
                  name="chuyenDe"
                  control={control}
                  rules={{ required: "Chuyên đề giảng dạy là bắt buộc" }}
                  render={({ field }) => <Input className="input-text" placeholder="Nhập chuyên đề giảng dạy ..." {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Loại hình bồi dưỡng <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.loaiHinh ? 'error' : ''}
                help={errors.loaiHinh?.message}
              >
                <Controller
                  name="loaiHinh"
                  control={control}
                  rules={{ required: "Loại hình bồi dưỡng là bắt buộc" }}
                  render={({ field }) => <Input className="input-text" placeholder="Nhập loại hình bồi dưỡng ..." {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-between">
              <Form.Item
                label={<span className="font-bold text-xl">Thời gian (đợt/năm) <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.thoiGian ? 'error' : ''}
                help={errors.thoiGian?.message}
              >
                <Controller
                  name="thoiGian"
                  control={control}
                  rules={{ required: "Thời gian là bắt buộc" }}
                  render={({ field }) => <Input className="input-text" placeholder="Nhập thời gian ..." {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Số HV <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.soHV ? 'error' : ''}
                help={errors.soHV?.message}
              >
                <Controller
                  name="soHV"
                  control={control}
                  rules={{ required: "Số HV là bắt buộc" }}
                  render={({ field }) => <InputNumber className="input-text" placeholder="Nhập số HV ..." {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-between">
              <Form.Item
                label={<span className="font-bold text-xl">Số tiết lý thuyết <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.soTietLT ? 'error' : ''}
                help={errors.soTietLT?.message}
              >
                <Controller
                  name="soTietLT"
                  control={control}
                  rules={{ required: "Số tiết lý thuyết là bắt buộc" }}
                  render={({ field }) => <InputNumber className="input-text" placeholder="Nhập số tiết lý thuyết ..." {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Số tiết thực hành <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.soTietTH ? 'error' : ''}
                help={errors.soTietTH?.message}
              >
                <Controller
                  name="soTietTH"
                  control={control}
                  rules={{ required: "Số tiết thực hành là bắt buộc" }}
                  render={({ field }) => <InputNumber className="input-text" placeholder="Nhập số tiết thực hành ..." {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-between">
              <Form.Item
                label={<span className="font-bold text-xl">Lớp giảng dạy <span className="text-red-600">*</span></span>}
                className="w-[40%]"
                validateStatus={errors.lopGiangDay ? 'error' : ''}
                help={errors.lopGiangDay?.message}
              >
                <Controller
                  name="lopGiangDay"
                  control={control}
                  rules={{ required: "Lớp giảng dạy là bắt buộc" }}
                  render={({ field }) => <Input className="input-text" placeholder="Nhập lớp giảng dạy ..." {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xl">Ghi chú</span>}
                className="w-[40%]"
                validateStatus={errors.ghiChu ? 'error' : ''}
                help={errors.ghiChu?.message}
              >
                <Controller
                  name="ghiChu"
                  control={control}
                  render={({ field }) => <Input.TextArea className="input-text" rows={4} placeholder="Nhập ghi chú ..." {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex justify-center space-x-4">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {editRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button onClick={onReset} danger>
                Huỷ bỏ
              </Button>
            </div>
          </Space>
        </Form>
      </div>

      <div className="p-5 shadow-xl bg-white rounded-xl flex-[70%]">
        <Title className="text-center" level={3}>DANH SÁCH</Title>
        {dataList.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">Chưa có dữ liệu</div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={dataList}
              pagination={{ current, pageSize, total: dataList.length }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
              summary={() => (
                <Table.Summary fixed="bottom">
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={6} className="font-bold text-xl text-right">
                      Tổng số giờ:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} className="font-bold text-xl text-center">
                      {totalSoTietQuyChuan}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingTypeForm;
