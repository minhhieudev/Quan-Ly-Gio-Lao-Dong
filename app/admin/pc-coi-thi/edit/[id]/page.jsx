"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Form, Select, InputNumber, Row, Col, DatePicker } from "antd";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from 'dayjs'; // Import dayjs for date handling
import { Road_Rage } from "next/font/google";

const { Option } = Select;

const formSchema = {
  hocPhan: [],
  lop: [],
  ngayThi: '',
  ca: 0,
  cbo1: '',
  cbo2: "",
  thoiGian: [],
  hinhThuc: [],
  phong: '',
  diaDiem: '',
  ghiChu: "",
  namHoc: "",
  loaiKyThi: "",
  hocKy: ''
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pc-coi-thi/edit?id=${id}`);
          if (res.ok) {
            const data = await res.json();

            // Trong phần xử lý ngày tháng
            let formattedNgayThi = dayjs(data.ngayThi, 'DD-MM-YYYY', true); // Định dạng 'DD-MM-YYYY'

            // Nếu ngày thi hợp lệ, tiếp tục format lại thành định dạng bạn muốn
            if (formattedNgayThi.isValid()) {
              const dataFormat = {
                ...data,
                ngayThi: formattedNgayThi.format('DD/MM/YYYY'), // Chuyển đổi sang 'DD/MM/YYYY' hoặc định dạng cần thiết
                hocKy: data.ky,
                lop: data?.lop?.map(lop => Array.isArray(lop) ? lop.join(', ') : lop).join(' - ')
              };

              setEditRecord(dataFormat);
              setLoai(dataFormat?.loaiDaoTao);
              reset(dataFormat);
            } else {
              toast.error("Ngày thi không hợp lệ!");
            }

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
    let formattedNgayThi = data.ngayThi;

    // Kiểm tra nếu ngày thi không phải là NaN và định dạng lại ngày tháng
    if (data.ngayThi) {
      const formattedDate = dayjs(data.ngayThi, 'DD/MM/YYYY').format('DD-MM-YYYY');
      formattedNgayThi = formattedDate;
    }

    // Tạo đối tượng dữ liệu mới với ngày đã được định dạng
    const transformedData = {
      ...data,
      ngayThi: formattedNgayThi,
    };

    // Tiếp tục logic gửi dữ liệu
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pc-coi-thi`;
      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify({ ...transformedData, id: id, loai }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!");
        // router.push("/admin/pc-coi-thi");
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
    <div className="p-4 bg-white shadow-lg rounded-lg mt-3 w-[70%] mx-auto h-[85vh]">
      <div className="flex items-between justify-center mb-3">
        <Button
          className="button-kiem-nhiem text-white font-bold shadow-md mb-2"
          onClick={() => router.push(`/admin/pc-coi-thi`)}
        >
          <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
        </Button>
        <h2 className="font-bold text-heading3-bold flex-grow text-center text-green-500">CHỈNH SỬA PHÂN CÔNG COI THI</h2>
        <div className="flex gap-2">
          <div className="text-heading4-bold">LOẠI:</div>
          <Select placeholder="Chọn loại hình đào tạo..." value={loai} onChange={(value) => setLoai(value)}>
            <Option value="Chính quy">Chính quy</Option>
            <Option value="Liên thông vừa làm vừa học">Liên thông vừa làm vừa học</Option>
          </Select>
        </div>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 font-bold">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên học phần" validateStatus={errors.hocPhan ? 'error' : ''} help={errors.hocPhan?.message}>
              <Controller
                name="hocPhan"
                control={control}
                rules={{ required: "Vui lòng nhập mã học phần" }}
                render={({ field }) => <Input placeholder="Nhập mã học phần, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nhóm / lớp" validateStatus={errors.lop ? 'error' : ''} help={errors.lop?.message}>
              <Controller
                name="lop"
                control={control}
                rules={{ required: "Vui lòng nhập nhóm lớp" }}
                render={({ field }) => <Input placeholder="Nhập nhóm lớp, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
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
                    onChange={(date, dateString) => field.onChange(dateString)} // Truyền lại chuỗi ngày đã chọn
                    value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null} // Chuyển chuỗi ngày thành đối tượng dayjs
                  />

                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Phòng thi" validateStatus={errors.phong ? 'error' : ''} help={errors.phong?.message}>
              <Controller
                name="phong"
                control={control}
                rules={{ required: "Vui lòng nhập phòng thi" }}
                render={({ field }) => <Input placeholder="Nhập phòng thi..." {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Ca thi" validateStatus={errors.ca ? 'error' : ''} help={errors.ca?.message}>
              <Controller
                name="ca"
                control={control}
                rules={{ required: "Vui lòng nhập ca thi" }}
                render={({ field }) => <InputNumber min={1} placeholder="Nhập ca thi..." style={{ width: '100%' }} {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Thời gian thi (phút)" validateStatus={errors.thoiGian ? 'error' : ''} help={errors.thoiGian?.message}>
              <Controller
                name="thoiGian"
                control={control}
                rules={{ required: "Vui lòng nhập thời gian thi" }}
                render={({ field }) => <Input placeholder="Nhập thời gian thi, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Hình thức thi" validateStatus={errors.hinhThuc ? 'error' : ''} help={errors.hinhThuc?.message}>
              <Controller
                name="hinhThuc"
                control={control}
                rules={{ required: "Vui lòng nhập Hình thức thi" }}
                render={({ field }) => <Input placeholder="Nhập Hình thức thi, cách nhau bởi dấu phẩy" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Tín chỉ" validateStatus={errors.tc ? 'error' : ''} help={errors.tc?.message}>
              <Controller
                name="tc"
                control={control}
                rules={{ required: "Vui lòng nhập Số tín chỉ" }}
                render={({ field }) => <InputNumber placeholder="Số tín chỉ .." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Địa điểm thi" validateStatus={errors.diaDiem ? 'error' : ''} help={errors.diaDiem?.message}>
              <Controller
                name="diaDiem"
                control={control}
                rules={{ required: "Vui lòng nhập địa điểm thi" }}
                render={({ field }) => <Input placeholder="Nhập địa điểm thi..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Ghi chú" validateStatus={errors.ghiChu ? 'error' : ''} help={errors.ghiChu?.message}>
              <Controller
                name="ghiChu"
                control={control}
                render={({ field }) => <Input.TextArea placeholder="Nhập ghi chú..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Cán bộ coi thi 1" validateStatus={errors.cbo1 ? 'error' : ''} help={errors.cbo1?.message}>
              <Controller
                name="cbo1"
                control={control}
                rules={{ required: "Vui lòng nhập cán bộ coi thi 1" }}
                render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 1..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cán bộ coi thi 2" validateStatus={errors.cbo2 ? 'error' : ''} help={errors.cbo2?.message}>
              <Controller
                name="cbo2"
                control={control}
                rules={{ required: "Vui lòng nhập cán bộ coi thi 2" }}
                render={({ field }) => <Input placeholder="Nhập cán bộ coi thi 2..." {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>


        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Năm học" validateStatus={errors.namHoc ? 'error' : ''} help={errors.namHoc?.message}>
              <Controller
                name="namHoc"
                control={control}
                rules={{ required: "Vui lòng nhập năm học" }}
                render={({ field }) => <Input placeholder="Nhập năm học..." {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Kỳ" validateStatus={errors.hocKy ? 'error' : ''} help={errors.hocKy?.message}>
              <Controller
                name="hocKy"
                control={control}
                rules={{ required: "Vui lòng học kỳ" }}
                render={({ field }) => (
                  <Select placeholder="Chọn học kỳ..." {...field}>
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
                    <Option value="he">3</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Loại kỳ thi" validateStatus={errors.loaiKyThi ? 'error' : ''} help={errors.loaiKyThi?.message}>
              <Controller
                name="loaiKyThi"
                control={control}
                rules={{ required: "Vui lòng chọn loại kỳ thi" }}
                render={({ field }) => (
                  <Select placeholder="Chọn loại kỳ thi..." {...field}>
                    <Option value="1">Chính thức</Option>
                    <Option value="2">Đợt 2</Option>
                    <Option value="3">Đợt 3</Option>
                    <Option value="4">Đợt 4</Option>
                    <Option value="5">Đợt 5</Option>
                    <Option value="6">Đợt 6</Option>
                    <Option value="7">Đợt 7</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end space-x-2">
          <Button type="default" onClick={resetForm} danger>Reset</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting} >Lưu</Button>
        </div>
      </Form>
    </div>
  );
};

export default PcCoiThiForm;
