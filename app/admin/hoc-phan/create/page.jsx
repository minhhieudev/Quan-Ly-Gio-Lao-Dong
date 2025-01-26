'use client'
import { useState, useRef, useEffect } from "react";
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
  soTietLT: 0,
  soTietTH: 0,
  trinhDo: "Đại học",
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

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);


  const onSubmit = async (data) => {
    try {
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch(`/api/admin/hoc-phan`, {
        method,
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newData = await res.json();
        toast.success("Thêm mới thành công!");
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

  const generateUniqueId = (() => {
    let counter = 0; // Biến đếm để đảm bảo giá trị không trùng lặp
    return () => {
      counter += 1;
      return `HP${Date.now()}${counter}`; // Kết hợp thời gian hiện tại và biến đếm
    };
  })();

  // Cập nhật hàm chuẩn hóa khoảng trắng
  const normalizeWhitespace = (str) => {
    return str
      .replace(/\s+/g, ' ')          // Chuẩn hóa khoảng trắng thành một dấu cách
      .replace(/\s*-\s*/g, ' - ')    // Chuẩn hóa dấu gạch ngang với khoảng trắng
      .trim();                       // Xóa khoảng trắng đầu cuối
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      let ListData = [];
      let khoa = "";

      // Đọc tất cả các sheet trong file Excel
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Lặp qua từng dòng trong sheet
        rawData.forEach((row, index) => {
          // Kiểm tra nếu dòng chứa thông tin khoa
          if (row[0] && typeof row[0] === 'string' && 
              /^\d+\.?\s*K(?:hoa|HOA)(?:\s+K(?:hoa|HOA))?\s/i.test(row[0])) {
            
            
            const khoaMatch = row[0].match(/^\d+\.?\s*K(?:hoa|HOA)\s+((?:K(?:hoa|HOA)\s+)?.*?)(?:\s*:|\s*$)/i);
            if (khoaMatch) {
              khoa = normalizeWhitespace(khoaMatch[1]);
            }
            return;
          }

          // Chỉ bỏ qua các dòng tiêu đề thực sự
          if (row[0] === "TT" || !row[0] || !row[1] || !row[2]) {
            return;
          }

          ListData.push({
            maMH: generateUniqueId(),
            tenMH: row[1] || "",
            soTC: row[2] || 0,
            soTietLT: row[3] || 0,
            soTietTH: row[4] || 0,
            trinhDo: row[5] || "",
            soLuong: row[6] || "",
            heSo: row[7] || "",
            ghiChu: row[8] || "",
            khoa: khoa
          });
        });
      });

      // Xử lý toàn bộ dữ liệu từ tất cả các sheet
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


  const createMany = async (ListData) => {
    setIsUploading(true);
    try {
      const method = "POST";
      const res = await fetch("/api/admin/hoc-phan/create", {
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
      fileInputRef.current.value = "";
      setIsUploading(false);
    }
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
          <Col span={4}>
            <Form.Item label="Trình độ" validateStatus={errors.trinhDo ? 'error' : ''} help={errors.trinhDo?.message}>
              <Controller
                name="trinhDo"

                control={control}
                rules={{ required: "Trình độ là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập trình độ..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Hệ số quy đổi" validateStatus={errors.heSo ? 'error' : ''} help={errors.heSo?.message}>
              <Controller
                name="heSo"
                control={control}
                rules={{ required: "Hệ số quy đổi là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập giá trị cách nhau bởi dấu '-'..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Số HSSV/nhóm" validateStatus={errors.soLuong ? 'error' : ''} help={errors.soLuong?.message}>
              <Controller
                name="soLuong"
                control={control}
                rules={{ required: "Số HSSV/nhóm là bắt buộc" }}
                render={({ field }) => <Input placeholder="Nhập giá trị cách nhau bởi dấu '-'..." {...field} />}
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

