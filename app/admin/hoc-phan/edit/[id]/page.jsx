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
  soTietLT: 0,
  soTietTH: 0,
  trinhDo: "",
  heSo: "",
  soLuong: "",
  ghiChu: ""
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
          const res = await fetch(`/api/admin/hoc-phan/edit?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            setEditRecord(data); // Lưu dữ liệu record
            reset(data); // Cập nhật form với dữ liệu từ API
          } else {
            toast.error("Không thể tải dữ liệu!");
          }
        } catch (error) {
          toast.error("Có lỗi xảy ra khi tải dữ liệu học phần!");
        }
      };

      fetchRecord();
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const url = `/api/admin/hoc-phan`;

      const res = await fetch(url, {
        method: "PUT",  // PUT để cập nhật record hiện tại
        body: JSON.stringify({ ...data, id: id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!");
        router.push("/admin/hoc-phan");
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
          onClick={() => router.push(`/admin/hoc-phan`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">PHÂN CÔNG GIẢNG DẠY</h2>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 font-bold">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Mã học phần" validateStatus={errors.maMH ? 'error' : ''} help={errors.maMH?.message}>
              <Controller
                name="maMH"
                control={control}
                rules={{ required: "Mã học phần là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập mã học phần..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tên môn học" validateStatus={errors.tenMH ? 'error' : ''} help={errors.tenMH?.message}>
              <Controller
                name="tenMH"
                control={control}
                rules={{ required: "Tên môn học là bắt buộc" }}
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
                rules={{ required: "Số tín chỉ là bắt buộc" }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tín chỉ..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số tiết LT" validateStatus={errors.soTietLT ? 'error' : ''} help={errors.soTietLT?.message}>
              <Controller
                name="soTietLT"
                control={control}
                rules={{ required: "Số tiết LT là bắt buộc" }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tiết LT..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số tiết TH" validateStatus={errors.soTietTH ? 'error' : ''} help={errors.soTietTH?.message}>
              <Controller
                name="soTietTH"
                control={control}
                rules={{ required: "Số tiết TH là bắt buộc" }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tiết TH..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Trình độ" validateStatus={errors.trinhDo ? 'error' : ''} help={errors.trinhDo?.message}>
              <Controller
                name="trinhDo"
               
                control={control}
                rules={{ required: "Trình độ là bắt buộc" }}
                render={({ field }) => <Input  placeholder="Nhập trình độ..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Hệ số quy đổi" validateStatus={errors.heSo ? 'error' : ''} help={errors.heSo?.message}>
              <Controller
                name="heSo"
                control={control}
                rules={{ required: "Hệ số quy đổi là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập hệ số quy đổi..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số HSSV/nhóm" validateStatus={errors.soLuong ? 'error' : ''} help={errors.soLuong?.message}>
              <Controller
                name="soLuong"
                control={control}
                rules={{ required: "Số HSSV/nhóm là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập số HSSV/nhóm..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Ghi chú" validateStatus={errors.ghiChu ? 'error' : ''} help={errors.ghiChu?.message}>
              <Controller
                name="ghiChu"
                control={control}
                render={({ field }) => <Input.TextArea placeholder="Nhập ghi chú..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-between mt-4">
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {editRecord ? "Cập nhật" : "Thêm mới"}
          </Button>
          <div className="text-center">
            <Spin spinning={isUploading}>
              <label htmlFor="excelUpload">
                <Button
                  className="mt-3 button-lien-thong-vlvh"
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang tải lên...' : 'Import từ file Excel'}
                </Button>
              </label>
            </Spin>

            <div className="hidden">
              <input
                type="file"
                accept=".xlsx, .xls"
                //onChange={handleFileUpload}
                className="hidden"
                id="excelUpload"
                ref={fileInputRef}
              />
            </div>
          </div>
          <Button onClick={resetForm} danger>Reset Form</Button>
        </div>
      </Form>
    </div>
  );
};

export default TeachingAssignmentForm;
