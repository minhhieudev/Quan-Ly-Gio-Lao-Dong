"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, InputNumber, Row, Col, DatePicker } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
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
  namHoc: "",
  loaiKyThi: ""
};

const PcCoiThiForm = () => {
  const [editRecord, setEditRecord] = useState(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: formSchema,
  });

  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();
  const { id } = useParams();

  const [loai, setLoai] = useState('');


  useEffect(() => {
    if (id) {
      const fetchRecord = async () => {
        try {
          const res = await fetch(`/api/giaovu/pc-coi-thi/edit?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            setEditRecord(data);
            setLoai(data?.loai)
            console.log("Data:", data)
            reset(data);
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
    // Chuyển đổi chuỗi nhập vào thành mảng
    const transformedData = {
      ...data,
      hocPhan: typeof data.hocPhan === 'string' ? data.hocPhan.split(',').map(item => item.trim()) : data.hocPhan,
      nhomLop: typeof data.nhomLop === 'string' ? data.nhomLop.split(',').map(item => item.trim()) : data.nhomLop,
      time: typeof data.time === 'string' ? data.time.split(',').map(item => parseInt(item.trim(), 10)) : data.time
    };

    // Tiếp tục logic gửi dữ liệu
    try {
      const url = `/api/giaovu/pc-coi-thi`;

      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify({ ...transformedData, id: id, loai }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!");
        router.push("/giaovu/pc-coi-thi");
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
      <div className="flex items-between justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/giaovu/pc-coi-thi`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">CHỈNH SỬA PHÂN CÔNG COI THI</h2>
        <div className="flex gap-2">
          <div className="text-heading4-bold">LOẠI:</div>
          <Select placeholder="Chọn loại hình đào tạo..." value={loai} onChange={(value) => setLoai(value)}>
            <Option value="chinh-quy">Chính quy</Option>
            <Option value="lien-thong-vlvh">Liên thông vừa làm vừa học</Option>
          </Select>
        </div>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-4 font-bold flex flex-col">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Tên học phần" validateStatus={errors.hocPhan ? 'error' : ''} help={errors.hocPhan?.message}>
              <Controller
                name="hocPhan"
                control={control}
                rules={{ required: "Vui lòng nhập tên học phần" }}
                render={({ field }) => <Input placeholder="Nhập tên học phần, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </div>
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Nhóm / lớp" validateStatus={errors.nhomLop ? 'error' : ''} help={errors.nhomLop?.message}>
              <Controller
                name="nhomLop"
                control={control}
                rules={{ required: "Vui lòng nhập nhóm lớp" }}
                render={({ field }) => <Input placeholder="Nhập nhóm lớp, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
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
          </div>

          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Ca thi" validateStatus={errors.ca ? 'error' : ''} help={errors.ca?.message}>
              <Controller
                name="ca"
                control={control}
                rules={{ required: "Vui lòng nhập ca thi" }}
                render={({ field }) => <InputNumber min={1} placeholder="Nhập ca thi..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </div>

          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Thời gian thi (phút)" validateStatus={errors.time ? 'error' : ''} help={errors.time?.message}>
              <Controller
                name="time"
                control={control}
                rules={{ required: "Vui lòng nhập thời gian thi" }}
                render={({ field }) => <Input placeholder="Nhập thời gian thi, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Cán bộ coi thi 1" validateStatus={errors.cb1 ? 'error' : ''} help={errors.cb1?.message}>
              <Controller
                name="cb1"
                control={control}
                rules={{ required: "Vui lòng nhập cán bộ coi thi 1" }}
                render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 1..." {...field} />}
              />
            </Form.Item>
          </div>
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Cán bộ coi thi 2" validateStatus={errors.cb2 ? 'error' : ''} help={errors.cb2?.message}>
              <Controller
                name="cb2"
                control={control}
                rules={{ required: "Vui lòng nhập cán bộ coi thi 2" }}
                render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 2..." {...field} />}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Địa điểm thi" validateStatus={errors.diaDiem ? 'error' : ''} help={errors.diaDiem?.message}>
              <Controller
                name="diaDiem"
                control={control}
                rules={{ required: "Vui lòng nhập địa điểm thi" }}
                render={({ field }) => <Input placeholder="Nhập địa điểm thi..." {...field} />}
              />
            </Form.Item>
          </div>
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Ghi chú" validateStatus={errors.ghiChu ? 'error' : ''} help={errors.ghiChu?.message}>
              <Controller
                name="ghiChu"
                control={control}
                render={({ field }) => <Input.TextArea placeholder="Nhập ghi chú..." {...field} />}
              />
            </Form.Item>
          </div>
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Phòng thi" validateStatus={errors.phongThi ? 'error' : ''} help={errors.phongThi?.message}>
              <Controller
                name="phongThi"
                control={control}
                rules={{ required: "Vui lòng nhập phòng thi" }}
                render={({ field }) => <Input placeholder="Nhập phòng thi..." {...field} />}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Năm học" validateStatus={errors.namHoc ? 'error' : ''} help={errors.namHoc?.message}>
              <Controller
                name="namHoc"
                control={control}
                rules={{ required: "Vui lòng nhập năm học" }}
                render={({ field }) => <Input placeholder="Nhập năm học..." {...field} />}
              />
            </Form.Item>
          </div>
          <div className="flex-1 min-w-[250px]">
            <Form.Item label="Loại kỳ thi" validateStatus={errors.loaiKyThi ? 'error' : ''} help={errors.loaiKyThi?.message}>
              <Controller
                name="loaiKyThi"
                control={control}
                rules={{ required: "Vui lòng chọn loại kỳ thi" }}
                render={({ field }) => (
                  <Select placeholder="Chọn loại kỳ thi..." {...field}>
                    <Option value="Chính thức">Chính thức</Option>
                    <Option value="Phụ">Phụ</Option>
                    <Option value="Hè">Hè</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="default" onClick={resetForm} danger>Reset</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>Lưu</Button>
        </div>
      </Form>

    </div>
  );
};

export default PcCoiThiForm;
