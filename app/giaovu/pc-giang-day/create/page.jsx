'use client'
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, InputNumber, Row, Col, Spin } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

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
  tuanHoc: ""
};

const TeachingAssignmentForm = () => {
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data) => {
    try {
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch(`/api/giaovu/pc-giang-day`, {
        method,
        body: JSON.stringify({ ...data, user: currentUser?._id, id: editRecord?._id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newData = await res.json();
        toast.success("Thành công!");
        resetForm();
        fileInputRef.current.value = "";
      } else {
        toast.error("Thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const resetForm = () => {
    reset(formSchema);
    setEditRecord(null);
  };

  const createMany = async (ListData) => {
    setIsUploading(true); // Bắt đầu hiển thị hiệu ứng xoay
    try {
      const method = "POST";
      const res = await fetch("/api/giaovu/pc-giang-day/create", {
        method,
        body: JSON.stringify({ data: ListData }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Thêm mới thành công");
      } else {
        toast.error("Failed to save record");
      }
    } catch (err) {
      toast.error("An error occurred while saving data:", err);
      console.log('Lỗi:', err);
    } finally {
      fileInputRef.current.value = ""; // Luôn luôn reset input file
      setIsUploading(false); // Ẩn hiệu ứng xoay khi hoàn thành
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    let namHoc = '';
    let ky = '';

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Tìm và gán giá trị cho namHoc và ky
      rawData.forEach((row) => {
        if (row[0] && typeof row[0] === 'string' && row[0].includes('Học kỳ')) {
          // Dòng chứa thông tin học kỳ và năm học
          const matches = row[0].match(/Học kỳ (\d+)[^0-9]*−[^0-9]*Năm học (\d{4}-\d{4})/);
          if (matches) {
            ky = matches[1]; // Gán giá trị kỳ học
            namHoc = matches[2]; // Gán giá trị năm học
          }
        }
      });

      // Lọc và định dạng dữ liệu theo cấu trúc mong muốn
      let ListData = rawData
        .filter((row) => row[1] && row[2] && row[3]) // Lọc các dòng có dữ liệu cần thiết
        .map((row) => {
          const maMH = row[1] || ""; // Mã môn học
          const tenMH = row[2] || ""; // Tên môn học
          const soTC = row[3] || ""; // Số tín chỉ
          const soSVDK = row[4] || ""; // Số sinh viên đăng ký
          const gvGiangDay = row[5] || ""; // Giảng viên giảng dạy
          const nhom = row[6] || ""; // Nhóm
          const thu = row[7] || ""; // Thứ
          const tietBD = row[8] || ""; // Tiết bắt đầu
          const soTiet = row[9] || ""; // Số tiết
          const phong = row[10] || ""; // Phòng học
          const lop = row[11] || ""; // Lớp
          const tuanHoc = row[12] || ""

          return [maMH, tenMH, soTC, soSVDK, gvGiangDay, nhom, thu, tietBD, soTiet, phong, lop, tuanHoc, namHoc, ky];
        });
      ListData.shift();

      console.log('Data:', ListData);

      if (ListData.length > 0) {
        createMany(ListData);
      } else {
        toast.error("No data found in file.");
      }
    };

    reader.onerror = () => {
      toast.error("Đã xảy ra lỗi khi đọc file Excel");
    };

    reader.readAsBinaryString(file);
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
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">PHÂN CÔNG GIẢNG DẠY</h2>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 font-bold">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Năm học:" validateStatus={errors.namHoc ? 'error' : ''} help={errors.namHoc?.message}>
              <Controller
                name="namHoc"
                control={control}
                rules={{ required: "Năm học là bắt buộc" }}
                render={({ field }) => (
                  <Select placeholder="Chọn năm học" {...field}>
                    <Option value="2021-2022">2021-2022</Option>
                    <Option value="2022-2023">2022-2023</Option>
                    <Option value="2023-2024">2023-2024</Option>
                    <Option value="2024-2025">2024-2025</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Học Kỳ:" validateStatus={errors.ky ? 'error' : ''} help={errors.ky?.message}>
              <Controller
                name="ky"
                control={control}
                rules={{ required: "Kì là bắt buộc" }}
                render={({ field }) => (
                  <Select placeholder="Chọn kì" {...field}>
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
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
                rules={{ required: "Mã môn học là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập mã môn học..." {...field} />}
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
            <Form.Item label="Số SV đăng ký">
              <Controller
                name="soSVDK"
                control={control}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số SV đăng ký..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Giảng viên" validateStatus={errors.gvGiangDay ? 'error' : ''} help={errors.gvGiangDay?.message}>
              <Controller
                name="gvGiangDay"
                control={control}
                rules={{ required: "Giảng viên là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập giảng viên..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Nhóm">
              <Controller
                name="nhom"
                control={control}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập nhóm..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Thứ" validateStatus={errors.thu ? 'error' : ''} help={errors.thu?.message}>
              <Controller
                name="thu"
                control={control}
                rules={{ required: "Thứ là bắt buộc" }}
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
                rules={{ required: "Tiết bắt đầu là bắt buộc" }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập tiết bắt đầu..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Số tiết" validateStatus={errors.soTiet ? 'error' : ''} help={errors.soTiet?.message}>
              <Controller
                name="soTiet"
                control={control}
                rules={{ required: "Số tiết là bắt buộc" }}
                render={({ field }) => <InputNumber min={0} placeholder="Nhập số tiết..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Phòng" validateStatus={errors.phong ? 'error' : ''} help={errors.phong?.message}>
              <Controller
                name="phong"
                control={control}
                rules={{ required: "Phòng là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập phòng..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Lớp" validateStatus={errors.lop ? 'error' : ''} help={errors.lop?.message}>
              <Controller
                name="lop"
                control={control}
                rules={{ required: "Lớp là bắt buộc" }}
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
                onChange={handleFileUpload}
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
