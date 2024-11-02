"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, InputNumber, Row, Col, Spin } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";

const { Option } = Select;

const formSchema = {
  maMH: "",
  tenMH: "",
  soTC: 0,
  soSVDK: 0,
  gvGiangDay: '',
  nhom: 0,
  thu: "",
  tietBD: 0,
  soTiet: 0,
  phong: "",
  lop: "",
  namHoc: "",
  ky: "",
  tuanHoc:"",
  diaDiem:''
};

const TeachingAssignmentForm = () => {
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();
  const { id } = useParams(); // Lấy ID từ param URL

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      // Gọi API để lấy dữ liệu theo ID
      const fetchRecord = async () => {
        try {
          const res = await fetch(`/api/giaovu/pc-giang-day/edit?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            setEditRecord(data); // Lưu dữ liệu record
            reset(data); // Cập nhật form với dữ liệu từ API
          } else {
            toast.error("Không thể tải dữ liệu!");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra khi tải dữ liệu!");
        }
      };

      fetchRecord();
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const url = `/api/giaovu/pc-giang-day`;

      const res = await fetch(url, {
        method: "PUT",  // PUT để cập nhật record hiện tại
        body: JSON.stringify({ ...data, id: id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!");
        router.push("/giaovu/pc-giang-day");
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const resetForm = () => {
    reset(formSchema);
    setEditRecord(null);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg mt-3 w-[70%] mx-auto">
      <div className="flex items-center justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/giaovu/pc-giang-day`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">CHỈNH SỬA PHÂN CÔNG GIẢNG DẠY</h2>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 font-bold">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Năm học" validateStatus={errors.namHoc ? 'error' : ''} help={errors.namHoc?.message}>
              <Controller
                name="namHoc"
                control={control}
                rules={{ required: "Vui lòng chọn năm học" }}
                render={({ field }) => (
                  <Select placeholder="Chọn năm học" {...field}>
                    <Option value="2023-2024">2023-2024</Option>
                    <Option value="2024-2025">2024-2025</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Kì" validateStatus={errors.ky ? 'error' : ''} help={errors.ky?.message}>
              <Controller
                name="ky"
                control={control}
                rules={{ required: "Vui lòng chọn kì" }}
                render={({ field }) => (
                  <Select placeholder="Chọn kì" {...field}>
                    <Option value="1">Kì 1</Option>
                    <Option value="2">Kì 2</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Mã môn học" validateStatus={errors.maMH ? 'error' : ''} help={errors.maMH?.message}>
              <Controller
                name="maMH"
                control={control}
                rules={{ required: "Vui lòng nhập mã môn học" }}
                render={({ field }) => <Input placeholder="Nhập mã môn học..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tên môn học" validateStatus={errors.tenMH ? 'error' : ''} help={errors.tenMH?.message}>
              <Controller
                name="tenMH"
                control={control}
                rules={{ required: "Vui lòng nhập tên môn học" }}
                render={({ field }) => <Input placeholder="Nhập tên môn học..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Số tín chỉ" validateStatus={errors.soTC ? 'error' : ''} help={errors.soTC?.message}>
              <Controller
                name="soTC"
                control={control}
                rules={{ required: "Vui lòng nhập số tín chỉ", min: { value: 1, message: "Số tín chỉ phải lớn hơn 0" } }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tín chỉ..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số SV đăng ký" validateStatus={errors.soSVDK ? 'error' : ''} help={errors.soSVDK?.message}>
              <Controller
                name="soSVDK"
                control={control}
                rules={{ required: "Vui lòng nhập số SV đăng ký", min: { value: 0, message: "Số SV không thể âm" } }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số SV đăng ký..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Giảng viên" validateStatus={errors.gvGiangDay ? 'error' : ''} help={errors.gvGiangDay?.message}>
              <Controller
                name="gvGiangDay"
                control={control}
                rules={{ required: "Vui lòng nhập giảng viên" }}
                render={({ field }) => <Input placeholder="Nhập giảng viên..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Nhóm" validateStatus={errors.nhom ? 'error' : ''} help={errors.nhom?.message}>
              <Controller
                name="nhom"
                control={control}
                rules={{ min: { value: 1, message: "Nhóm phải lớn hơn 0" } }}
                render={({ field }) => (
                  <InputNumber
                    min={0}
                    placeholder="Nhập nhóm..."
                    style={{ width: '100%' }}
                    {...field}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Thứ" validateStatus={errors.thu ? 'error' : ''} help={errors.thu?.message}>
              <Controller
                name="thu"
                control={control}
                rules={{ required: "Vui lòng chọn thứ" }}
                render={({ field }) => (
                  <Select placeholder="Chọn thứ" {...field}>
                    <Option value="2">Thứ 2</Option>
                    <Option value="3">Thứ 3</Option>
                    <Option value="4">Thứ 4</Option>
                    <Option value="5">Thứ 5</Option>
                    <Option value="6">Thứ 6</Option>
                    <Option value="7">Thứ 7</Option>
                    <Option value="Chủ nhật">Chủ nhật</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Tiết bắt đầu" validateStatus={errors.tietBD ? 'error' : ''} help={errors.tietBD?.message}>
              <Controller
                name="tietBD"
                control={control}
                rules={{ required: "Vui lòng nhập tiết bắt đầu", min: { value: 1, message: "Tiết bắt đầu phải lớn hơn 0" } }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập tiết bắt đầu..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Số tiết" validateStatus={errors.soTiet ? 'error' : ''} help={errors.soTiet?.message}>
              <Controller
                name="soTiet"
                control={control}
                rules={{ required: "Vui lòng nhập số tiết", min: { value: 1, message: "Số tiết phải lớn hơn 0" } }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tiết..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Phòng" validateStatus={errors.phong ? 'error' : ''} help={errors.phong?.message}>
              <Controller
                name="phong"
                control={control}
                rules={{ required: "Vui lòng nhập phòng" }}
                render={({ field }) => <Input placeholder="Nhập phòng..." {...field} />}
              />
            </Form.Item>
          </Col>

        </Row>
        <Row gutter={16}>

          
          <Col span={8}>
            <Form.Item label="Lớp" validateStatus={errors.lop ? 'error' : ''} help={errors.lop?.message}>
              <Controller
                name="lop"
                control={control}
                rules={{ required: "Vui lòng nhập lớp" }}
                render={({ field }) => <Input placeholder="Nhập lớp..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tuần học" >
              <Controller
                name="tuanHoc"
                control={control}
                render={({ field }) => <Input placeholder="Nhập tuần học" {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Địa điểm" validateStatus={errors.diaDiem ? 'error' : ''} help={errors.diaDiem?.message}>
              <Controller
                name="diaDiem"
                control={control}
                rules={{ required: "Vui lòng nhập địa điểm" }}
                render={({ field }) => (
                  <Select allowClear placeholder="Chọn địa điểm" {...field}>
                    <Option value="DHPY">DHPY</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

        </Row>

        <div className="flex justify-between mt-4">
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Cập nhật
          </Button>
          <Button onClick={resetForm} danger>Reset Form</Button>
        </div>
      </Form>
    </div>
  );
};

export default TeachingAssignmentForm;
