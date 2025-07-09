"use client";

import { useState, useEffect } from "react";
import { Form, Input, DatePicker, Button, message, Spin, Typography } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title } = Typography;

const Setting = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingId, setSettingId] = useState(null);

    // Lấy thông tin Setting khi load trang
    useEffect(() => {
        const fetchSetting = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/admin/setting");
                const data = await res.json();
                if (data && data.length > 0) {
                    const s = data[0];
                    setSettingId(s._id);
                    form.setFieldsValue({
                        noty: s.noty,
                        schoolYearStart: s.schoolYearStart ? dayjs(s.schoolYearStart) : null,
                        schoolYearEnd: s.schoolYearEnd ? dayjs(s.schoolYearEnd) : null,
                        startRegulation: s.startRegulation ? dayjs(s.startRegulation) : null,
                        endRegulation: s.endRegulation ? dayjs(s.endRegulation) : null,
                    });
                } else {
                    setSettingId(null);
                    form.resetFields();
                }
            } catch (err) {
                message.error("Không thể tải thông tin Setting");
            }
            setLoading(false);
        };
        fetchSetting();
    }, [form]);

    // Xử lý lưu Setting
    const onFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                ...values,
                schoolYearStart: values.schoolYearStart ? values.schoolYearStart.toISOString() : null,
                schoolYearEnd: values.schoolYearEnd ? values.schoolYearEnd.toISOString() : null,
                startRegulation: values.startRegulation ? values.startRegulation.toISOString() : null,
                endRegulation: values.endRegulation ? values.endRegulation.toISOString() : null,
            };
            let res;
            if (settingId) {
                // Update
                res = await fetch("/api/admin/setting", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: settingId }),
                });
            } else {
                // Create
                res = await fetch("/api/admin/setting", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (res.ok) {
                message.success("Đã lưu Setting thành công!");
                // Sau khi lưu, reload lại dữ liệu để cập nhật id nếu vừa tạo mới
                const reload = await fetch("/api/admin/setting");
                const reloadData = await reload.json();
                if (reloadData && reloadData.length > 0) {
                    setSettingId(reloadData[0]._id);
                }
            } else {
                message.error("Lưu Setting thất bại!");
            }
        } catch (err) {
            message.error("Có lỗi khi lưu Setting!");
        }
        setSaving(false);
    };

    return loading ? (
        <div className="flex justify-center items-center h-96">
            <Spin size="large" />
        </div>
    ) : (
        <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-blue-100 rounded-full p-4 mb-2 shadow">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V3m0 0a9 9 0 100 18 9 9 0 000-18zm0 0v3m0 12v3m9-9h-3m-12 0H3" />
                    </svg>
                </div>
                <Title level={3} className="text-center mb-0 text-blue-700 tracking-wide">Cài đặt hệ thống</Title>
                <p className="text-gray-500 text-sm mt-1">Quản lý các thông số hệ thống, năm học và thông báo chung</p>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"
            >
                <Form.Item label={<span className="font-semibold">Thông báo chung</span>} name="noty" className="md:col-span-2">
                    <TextArea rows={3} placeholder="Nhập thông báo chung..." className="rounded-lg border-blue-200 focus:border-blue-400" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold">Ngày bắt đầu năm học</span>} name="schoolYearStart">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" className="rounded-lg border-blue-200 focus:border-blue-400" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold">Ngày kết thúc năm học</span>} name="schoolYearEnd">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" className="rounded-lg border-blue-200 focus:border-blue-400" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold">Bắt đầu:</span>} name="startRegulation">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" className="rounded-lg border-blue-200 focus:border-blue-400" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold">Hạn nộp:</span>} name="endRegulation">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" className="rounded-lg border-blue-200 focus:border-blue-400" />
                </Form.Item>
                <Form.Item className="md:col-span-2 mt-4">
                    <Button type="primary" htmlType="submit" loading={saving} className="w-full h-12 text-lg rounded-lg bg-blue-500 hover:bg-blue-600">
                        Lưu thông tin
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Setting;
