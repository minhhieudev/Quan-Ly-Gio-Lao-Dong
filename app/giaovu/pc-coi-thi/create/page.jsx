'use client';

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, DatePicker, Spin } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import dayjs from 'dayjs'; // Import dayjs for date handling

const { Option } = Select;

const formSchema = {
  hocPhan: [],
  nhomLop: [],
  ngayThi: '',
  ca: 0,
  cb1: '',
  cb2: "",
  time: [],
  phongThi: '',
  diaDiem: '',
  ghiChu: "",
  loaiKyThi: "",
  loai: ""
};

const TeachingAssignmentForm = () => {
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();

  const [loai, setLoai] = useState("");
  const [ky, setKy] = useState("");
  const [namHocs, setNamHocs] = useState("");

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data) => {

    if (loai == "" || namHocs == "" || ky == "") {
      toast.error("Vui lòng chọn đủ Loại hình, năm học và kỳ !");
      return
    }

    // Chuyển đổi các trường dạng chuỗi thành mảng
    data.hocPhan = data.hocPhan.split(',').map(item => item.trim());
    data.nhomLop = data.nhomLop.split(',').map(item => item.trim());
    data.time = data.time.split(',').map(item => item.trim());

    try {
      console.log('Data:', data);
      const method = editRecord ? "PUT" : "POST";
      const res = await fetch(`/api/giaovu/pc-coi-thi`, {
        method,
        body: JSON.stringify({ ...data, user: currentUser?._id, id: editRecord?._id, loai, namHocs, ky}),
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
      const res = await fetch("/api/giaovu/pc-coi-thi/create", {
        method,
        body: JSON.stringify({ data: ListData }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Thêm mới thành công");
      } else {
        toast.error("Import thất bài, file chưa đúng định dạng yêu cầu !");
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

    if (loai == "" || namHocs == "" || ky == "") {
      toast.error("Vui lòng chọn đủ Loại hình, năm học và kỳ !");
      fileInputRef.current.value = "";
      return
    }
   
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      console.log('Raw Data:', rawData);

      const structuredData = [];
      let currentEntry = null;
      let loaiKyThi = '';
      let namHoc = '';

      rawData.forEach((row) => {
        if (row.length === 1 && typeof row[0] === 'string' && /^\d\./.test(row[0])) {
          console.log('Input:', row);

          const inputString = row[0].trim();
          const yearMatch = inputString.match(/(?:Năm học\s*|\s*[-|,]?\s*)?(\d{4}\s*[-\s]\s*\d{4})$/);

          if (yearMatch) {
            namHoc = yearMatch[1].trim().replace(/\s+/g, '-');
            namHoc = namHoc.replace(/-{2,}/g, '-');

            loaiKyThi = inputString.split(namHoc)[0].trim();
            loaiKyThi = loaiKyThi.replace(/[-|,]?\s*Năm học.*$/, '').trim().replace(/^\d+\.\s*/, '');
            loaiKyThi = loaiKyThi.split(/,\s*| - /)[0].trim();
          } else {
            loaiKyThi = inputString;
          }

          if (loaiKyThi.includes('Năm học') || loaiKyThi.includes('năm học')) {
            loaiKyThi = loaiKyThi.split(/[-|,]?\s*Năm học/)[0].trim();
          }
          console.log('loaiKyThi:', loaiKyThi);
          console.log('namHoc:', namHoc);
        } else if (row.length > 1) {
          if (typeof row[0] === 'number') {
            if (currentEntry) {
              structuredData.push(currentEntry);
            }
            currentEntry = {
              loaiKyThi,
              namHoc,
              hocPhan: [row[1]],
              nhomLop: [row[2]],
              ngayThi: dayjs(row[3]).format('DD/MM/YYYY'), 
              ca: row[4],
              phongThi: row[5],
              cb1: row[6],
              cb2: row[7],
              time: [row[8]],
              diaDiem: row[9],
              ghiChu: row[10] || '',
              loai,
              ky
            };
          } else if (typeof row[0] === 'undefined') {
            if (currentEntry) {
              currentEntry.hocPhan.push(row[1]);
              currentEntry.nhomLop.push(row[2]);
              currentEntry.time.push(row[8]);
            }
          }
        }
      });

      if (currentEntry) {
        structuredData.push(currentEntry);
      }

      console.log('Structured Data:', structuredData);
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
          onClick={() => router.push(`/giaovu/pc-coi-thi`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">PHÂN CÔNG COI THI</h2>

      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <div className="text-base-bold">Loại:</div>
          <Select placeholder="Chọn loại hình đào tạo..." onChange={(value) => setLoai(value)}>
            <Option value="chinh-quy">Chính quy</Option>
            <Option value="lien-thong-vlvh">Liên thông vừa làm vừa học</Option>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="text-base-bold">Năm học:</div>
          <Select
            placeholder="Chọn năm học"
            onChange={(value) => setNamHocs(value)}
            className="w-[50%]"
          >
            <Option value="2021-2022">2021-2022</Option>
            <Option value="2022-2023">2022-2023</Option>
            <Option value="2023-2024">2023-2024</Option>
            <Option value="2024-2025">2024-2025</Option>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="text-base-bold">Kỳ:</div>
          <Select placeholder="Chọn kỳ..." onChange={(value) => setKy(value)}>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </div>

      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                  placeholder="Nhập loại kỳ thi"
                  onChange={(value) => setLoaiKyThi(value)}
                  className="w-[50%]"
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
              rules={{ required: "Học phần là bắt buộc" }}
              render={({ field }) => (
                <Input placeholder="Nhập học phần (ngăn cách bởi dấu phẩy)..." {...field} />
              )}
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
              rules={{ required: "Nhóm lớp là bắt buộc" }}
              render={({ field }) => (
                <Input placeholder="Nhập nhóm/lớp (ngăn cách bởi dấu phẩy)..." {...field} />
              )}
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
              rules={{ required: "Ngày thi là bắt buộc" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  onChange={(date, dateString) => field.onChange(dateString)}
                  value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                />
              )}
            />
          </Form.Item>

          {/* Ca */}
          <Form.Item
            label="Ca"
            validateStatus={errors.ca ? 'error' : ''}
            help={errors.ca?.message}
          >
            <Controller
              name="ca"
              control={control}
              rules={{ required: "Ca là bắt buộc" }}
              render={({ field }) => (
                <Input type="number" placeholder="Nhập ca" {...field} />
              )}
            />
          </Form.Item>

          {/* Phòng thi */}
          <Form.Item
            label="Phòng thi"
            validateStatus={errors.phongThi ? 'error' : ''}
            help={errors.phongThi?.message}
          >
            <Controller
              name="phongThi"
              control={control}
              render={({ field }) => (
                <Input placeholder="Nhập phòng thi" {...field} />
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
              render={({ field }) => (
                <Input placeholder="Nhập cán bộ coi thi 1" {...field} />
              )}
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
              render={({ field }) => (
                <Input placeholder="Nhập cán bộ coi thi 2" {...field} />
              )}
            />
          </Form.Item>

          {/* Thời gian */}
          <Form.Item
            label="Thời gian (phút)"
            validateStatus={errors.time ? 'error' : ''}
            help={errors.time?.message}
          >
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <Input placeholder="Nhập thời gian (ngăn cách bởi dấu phẩy)..." {...field} />
              )}
            />
          </Form.Item>

          {/* Địa điểm thi */}
          <Form.Item
            label="Địa điểm thi"
            validateStatus={errors.diaDiem ? 'error' : ''}
            help={errors.diaDiem?.message}
          >
            <Controller
              name="diaDiem"
              control={control}
              render={({ field }) => (
                <Input placeholder="Nhập địa điểm thi" {...field} />
              )}
            />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item
            label="Ghi chú"
            validateStatus={errors.ghiChu ? 'error' : ''}
            help={errors.ghiChu?.message}
          >
            <Controller
              name="ghiChu"
              control={control}
              render={({ field }) => (
                <Input.TextArea placeholder="Nhập ghi chú" {...field} />
              )}
            />
          </Form.Item>


        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {editRecord ? "Cập nhật" : "Lưu"}
          </Button>

          <div className="text-center">
            <Spin spinning={isUploading}>
              <label htmlFor="excelUpload">
                <Button
                  className="mt-3"
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

          <Button type="default" onClick={resetForm} className="ml-2">
            Huỷ
          </Button>
        </div>
      </Form>

    </div>
  );
};

export default TeachingAssignmentForm;
