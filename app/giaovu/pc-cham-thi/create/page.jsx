'use client';

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, DatePicker, Spin } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Option } = Select;

const formSchema = {
  hocPhan: '',
  nhomLop: '',
  ngayThi: '',
  cb1: '',
  cb2: "",
  soBai: 0,
  namHoc: "",
  loaiKyThi: "",
  loai: "",
  hinhThuc: '',
  thoiGian: ''
};

const TeachingAssignmentForm = () => {
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();

  const [loai, setLoai] = useState("Chính quy");

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [listOptions, setListOptions] = useState([]);


  useEffect(() => {
    fetchDataOption();
  }, []);

  const fetchDataOption = async () => {
    try {
      const res = await fetch(`/api/admin/hinh-thuc-thi`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setListOptions(data);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    }
  };

  const onSubmit = async (data) => {
    if (loai === "") {
      toast.error("Vui lòng chọn Loại hình đào tạo trước!");
      return;
    }

    // Không cần chuyển đổi các trường dạng chuỗi thành mảng nữa
    try {
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch(`/api/giaovu/pc-cham-thi`, {
        method,
        body: JSON.stringify({ ...data, user: currentUser?._id, id: editRecord?._id, loai }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
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
    setIsUploading(true);
    try {
      const method = "POST";
      const res = await fetch("/api/giaovu/pc-cham-thi/create", {
        method,
        body: JSON.stringify({ data: ListData }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Thêm mới thành công");
      } else {
        toast.error("Import thất bại, file chưa đúng định dạng yêu cầu!");
      }
    } catch (err) {
      toast.error("An error occurred while saving data:", err);
      console.log('Lỗi:', err);
    } finally {
      fileInputRef.current.value = "";
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    if (loai === "") {
      toast.error("Vui lòng chọn Loại hình đào tạo trước!");
      fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const structuredData = [];
      let currentEntry = null;
      let loaiKyThi = '';
      let namHoc = '';

      rawData.forEach((row) => {
        if (row.length === 1 && typeof row[0] === 'string' && /^\d\./.test(row[0])) {
          const inputString = row[0].trim();
          const yearMatch = inputString.match(/(?:Năm học\s*|\s*[-|,]?\s*)?(\d{4}\s*[-\s]\s*\d{4})$/);

          if (yearMatch) {
            namHoc = yearMatch[1].trim().replace(/\s+/g, '-').replace(/-{2,}/g, '-');
            loaiKyThi = inputString.split(namHoc)[0].trim();
            loaiKyThi = loaiKyThi.replace(/[-|,]?\s*Năm học.*$/, '').trim().replace(/^\d+\.\s*/, '');
            loaiKyThi = loaiKyThi.split(/,\s*| - /)[0].trim();
          } else {
            loaiKyThi = inputString;
          }

          if (loaiKyThi.includes('Năm học') || loaiKyThi.includes('năm học')) {
            loaiKyThi = loaiKyThi.split(/[-|,]?\s*Năm học/)[0].trim();
          }
        } else if (row.length > 1) {
          if (typeof row[0] === 'number') {
            if (currentEntry) {
              structuredData.push(currentEntry);
            }
            currentEntry = {
              loaiKyThi,
              namHoc,
              hocPhan: row[1],
              nhomLop: row[2],
              ngayThi: dayjs(row[3]).format('DD/MM/YYYY'),
              cb1: row[4],
              cb2: row[5],
              hinhThuc: row[7],
              thoiGian: row[8],
              soBai: parseInt(row[6], 6) || 0, // Số bài là số nguyên, thêm kiểm tra nếu trường này có giá trị null
              loai
            };
          }
        }
      });

      if (currentEntry) {
        structuredData.push(currentEntry);
      }

      createMany(structuredData);
    };

    reader.onerror = () => {
      toast.error("Đã xảy ra lỗi khi đọc file Excel");
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg mt-3 w-[70%] mx-auto font-bold">
      <div className="flex items-center justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/giaovu/pc-cham-thi`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">PHÂN CÔNG CHẤM THI</h2>
        <div className="flex gap-2">
          <div className="text-heading4-bold">LOẠI:</div>
          <Select
            defaultValue="Chính quy" // Giá trị mặc định
            placeholder="Chọn loại hình đào tạo..."
            onChange={(value) => setLoai(value)}
          >
            <Option value="Chính quy">Chính quy</Option>
            <Option value="Liên thông vlvh">Liên thông vừa làm vừa học</Option>
          </Select>

        </div>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Năm học */}
          <Form.Item
            label="Năm học"
            validateStatus={errors.namHoc ? 'error' : ''}
            help={errors.namHoc?.message}
          >
            <Controller
              name="namHoc"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="Chọn năm học"
                  {...field}
                >
                  <Option value="2021-2022">2021-2022</Option>
                  <Option value="2022-2023">2022-2023</Option>
                  <Option value="2023-2024">2023-2024</Option>
                  <Option value="2024-2025">2024-2025</Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Học kỳ"
            validateStatus={errors.ky ? 'error' : ''}
            help={errors.ky?.message}
          >
            <Controller
              name="ky"
              control={control}
              rules={{ required: 'Học kỳ là bắt buộc' }}
              render={({ field }) => (
                <Select
                  placeholder="Chọn học kỳ"
                  {...field}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                </Select>
              )}
            />
          </Form.Item>

          {/* Loại kỳ thi */}
          <Form.Item
            label="Loại kỳ thi"
            validateStatus={errors.loaiKyThi ? 'error' : ''}
            help={errors.loaiKyThi?.message}
          >
            <Controller
              name="loaiKyThi"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="Chọn loại kỳ thi"
                  {...field}
                >
                  <Option value="Học kỳ 1">Học kỳ 1</Option>
                  <Option value="Học kỳ 1 (đợt 2)">Học kỳ 1 (đợt 2)</Option>
                  <Option value="Học kỳ 1 (đợt 3)">Học kỳ 1 (đợt 3)</Option>
                  <Option value="Học kỳ 2">Học kỳ 2</Option>
                  <Option value="Học kỳ 2 (đợt 2)">Học kỳ 2 (đợt 2)</Option>
                  <Option value="Học kỳ 2 (đợt 3)">Học kỳ 2 (đợt 3)</Option>
                  <Option value="Kỳ thi phụ (đợt 1)">Kỳ thi phụ (đợt 1)</Option>
                  <Option value="Kỳ thi phụ (đợt 2)">Kỳ thi phụ (đợt 2)</Option>
                  <Option value="Kỳ thi phụ (đợt 3)">Kỳ thi phụ (đợt 3)</Option>
                  <Option value="Học kỳ hè">Học kỳ hè</Option>
                </Select>
              )}
            />
          </Form.Item>

          {/* Học phần */}
          <Form.Item
            label="Học phần"
            validateStatus={errors.hocPhan ? 'error' : ''}
            help={errors.hocPhan?.message}
          >
            <Controller
              name="hocPhan"
              control={control}
              render={({ field }) => <Input placeholder="Nhập học phần" {...field} />}
            />
          </Form.Item>

          {/* Nhóm lớp */}
          <Form.Item
            label="Nhóm lớp"
            validateStatus={errors.nhomLop ? 'error' : ''}
            help={errors.nhomLop?.message}
          >
            <Controller
              name="nhomLop"
              control={control}
              render={({ field }) => <Input placeholder="Nhập nhóm lớp" {...field} />}
            />
          </Form.Item>

          {/* Ngày thi */}
          <Form.Item
            label="Ngày thi"
            validateStatus={errors.ngayThi ? 'error' : ''}
            help={errors.ngayThi?.message}
          >
            <Controller
              name="ngayThi"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Chọn ngày thi"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  onChange={(date, dateString) => field.onChange(dateString)}
                  value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                />
              )}
            />
          </Form.Item>

          {/* Cán bộ coi thi 1 */}
          <Form.Item
            label="Cán bộ coi thi 1"
            validateStatus={errors.cb1 ? 'error' : ''}
            help={errors.cb1?.message}
          >
            <Controller
              name="cb1"
              control={control}
              render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 1" {...field} />}
            />
          </Form.Item>

          {/* Cán bộ coi thi 2 */}
          <Form.Item
            label="Cán bộ coi thi 2"
            validateStatus={errors.cb2 ? 'error' : ''}
            help={errors.cb2?.message}
          >
            <Controller
              name="cb2"
              control={control}
              render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 2" {...field} />}
            />
          </Form.Item>

          {/* Số bài thi */}
          <Form.Item
            label="Số bài thi"
            validateStatus={errors.soBai ? 'error' : ''}
            help={errors.soBai?.message}
          >
            <Controller
              name="soBai"
              control={control}
              render={({ field }) => <Input type="number" placeholder="Nhập số bài thi" {...field} />}
            />
          </Form.Item>

          {/* Hình thức thời gian */}
          <Form.Item
            label="Hình thức thi ..."
            validateStatus={errors.hinhThuc ? 'error' : ''}
            help={errors.hinhThuc?.message}
          >
            <Controller
              name="hinhThuc"
              control={control}
              render={({ field }) =>
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn hình thức..."
                  {...field}
                  options={listOptions.map(item => ({
                    value: item.ten,
                    label: item.ten,
                  }))}
                // filterOption={(input, option) =>
                //     option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                // }
                // onChange={(value) => {
                //   field.onChange(value);
                //   handleSelectChange2(value);
                // }}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label="Thời gian thi ..."
            validateStatus={errors.thoiGian ? 'error' : ''}
            help={errors.thoiGian?.message}
          >
            <Controller
              name="thoiGian"
              control={control}
              render={({ field }) =>
                <Select
                  size="small"
                  placeholder="Chọn thời gian thi..."
                  allowClear
                  className="w-[50%]"
                  {...field}
                  onChange={(value) => {
                    field.onChange(value); // Cập nhật giá trị trong form
                  }}
                >
                  <Option value="45">45</Option>
                  <Option value="60">60</Option>
                  <Option value="90">90</Option>
                  <Option value="120">120</Option>
                  <Option value="180">180</Option>
                </Select>
              }
            />
          </Form.Item>


        </div>

        <div className="flex justify-end gap-4">

          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className="bg-blue-500 text-white"
          >
            Lưu
          </Button>
          <div className="hidden">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx"

            />
          </div>
          <Button
            type="primary"
            onClick={() => fileInputRef.current.click()}
            icon={<UploadOutlined />}
            loading={isUploading}
          >
            Upload Excel File
          </Button>
          <Button type="default" onClick={resetForm} danger>Reset</Button>
        </div>
      </Form>
    </div>
  );
};

export default TeachingAssignmentForm;
