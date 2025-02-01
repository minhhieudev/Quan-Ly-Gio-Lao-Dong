'use client';
import React, { useState, useEffect } from "react";
import { Input, Button, Upload, Form, Card, Checkbox } from "antd";
import { InboxOutlined, SendOutlined, MailOutlined, FileAddOutlined, SearchOutlined, Spin } from "@ant-design/icons";
import toast from "react-hot-toast";
import { CldUploadButton } from "next-cloudinary";

const { TextArea } = Input;

const SendEmail = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [dataList, setDataList] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [fileList, setFileList] = useState([]);
    const [fileUrl, setFileUrl] = useState([]);

    const [loadingEmail, setLoadingEmail] = useState(false);
    const [customEmail, setCustomEmail] = useState(""); // Trường nhập email tùy chỉnh

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/user`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataList(data); // Data chứa danh sách người dùng
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const handleCheckAll = (e) => {
        const checked = e.target.checked;
        setAllChecked(checked);
        setSelectedEmails(checked ? filteredData.map(user => user.email) : []);
    };

    const handleCheckboxChange = (email) => {
        setSelectedEmails(prevSelected => {
            if (prevSelected.includes(email)) {
                return prevSelected.filter(item => item !== email);
            } else {
                return [...prevSelected, email];
            }
        });
    };

    // Tìm kiếm email dựa trên từ khóa
    const filteredData = dataList?.filter(user => user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    const onFinish = async (values) => {
        if (selectedEmails.length === 0 && !customEmail) {
            toast.error("Vui lòng chọn ít nhất một email hoặc nhập email!");
            return;
        }

        // Thêm email từ trường nhập tùy chỉnh vào selectedEmails
        const customEmails = customEmail.split(',').map(email => email.trim()).filter(email => email);
        const allEmails = [...selectedEmails, ...customEmails];

        setLoading(true);
        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: values.subject,
                    text: values.content,
                    attachments: fileUrl,
                    email: allEmails
                })
            });

            if (res.ok) {
                setLoading(false);
                setFileUrl([]);
                setCustomEmail(""); // Xóa trường email tùy chỉnh sau khi gửi
                setSelectedEmails([]); // Xóa các email đã chọn
                toast.success("Đã gửi email tới các giảng viên !");

            } else {
                toast.error("Có lỗi xảy ra!");
            }
        } catch (err) {
            console.log(err);
            toast.error("Có lỗi xảy ra!", err);
        }
    };

    const uploadPhoto = async (result) => {
        const url = result?.info?.secure_url;
        const filename = result?.info.original_filename;

        const publicId = result?.info.public_id;
        const fileExtension = publicId?.split('.').pop();

        const contentType = fileExtension === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : fileExtension?.startsWith('jpg') || fileExtension?.startsWith('png') || fileExtension?.startsWith('jpeg')
                ? `image/${fileExtension}`
                : 'application/octet-stream';

        const fileObject = {
            filename: `${filename}.${fileExtension}`,
            path: url,
            contentType
        };

        setFileUrl((prevUrls) => [...prevUrls, fileObject]);
    };

    const contentEmail = `
  Kính gửi Quý Thầy / Cô,

  Trường Đại học Phú Yên xin gửi tới Quý Thầy / Cô thông báo về bảng tổng hợp lao động giảng viên của trường.
  Trong bảng tổng hợp này, Quý Thầy / Cô sẽ thấy các thông tin chi tiết về công tác giảng dạy, công tác khác, và tổng số giờ lao động.Xin vui lòng kiểm tra kỹ lưỡng và phản hồi nếu có bất kỳ thắc mắc hay điều chỉnh nào cần thiết.

  Bảng tổng hợp lao động này bao gồm:
  1. Thông tin chi tiết về công tác giảng dạy chính quy.
  2. Thông tin về các công tác khác như chấm thi, coi thi, ngoại khóa, và đề thi.
  3. Tổng số giờ lao động và sự cân đối về giờ lao động.

  Quý Thầy / Cô có thể tải xuống bảng tổng hợp lao động từ tệp đính kèm trong email này.

  Nếu có bất kỳ câu hỏi hay cần thêm thông tin, xin vui lòng liên hệ với Phòng Hành chính - Nhân sự qua email hoặc số điện thoại dưới đây.

  Trân trọng,
  Nguyễn Văn B
  Phòng Hành chính - Nhân sự
  Trường Đại học Phú Yên
  email @example.com
  0123 456 789
  `

    return (
        <div className="py-4 px-6 h-[90vh] bg-gradient-to-r from-blue-100 via-white to-blue-100 mt-2">
            <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                <MailOutlined /> Gửi Email
            </h2>
            <div className="flex gap-3">
                <div className="flex-[70%]">
                    <Card bordered={false} className="shadow-lg">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item label={<span className="font-semibold text-blue-600">Email người nhận (nếu không chọn)</span>}>
                                <Input
                                    placeholder="Nhập email cách nhau bởi dấu ','"
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-blue-600">Tiêu đề</span>}
                                name="subject"
                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                            >
                                <Input
                                    placeholder="Nhập tiêu đề email"
                                    prefix={<FileAddOutlined />}
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-blue-600">Nội dung</span>}
                                name="content"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung email!" }]}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Nhập nội dung email"
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item label={<span className="font-semibold text-blue-600">Đính kèm tập tin</span>} name="attachments">
                                <div className="border-dashed border-2 border-blue-500 rounded-lg p-4 text-center bg-blue-50 hover:bg-blue-100 transition-all duration-300">
                                    <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                    <p className="text-blue-600 mt-2"> Chọn file gửi Email</p>
                                    <CldUploadButton
                                        className="button-huong-dan rounded-md shadow-md mt-2"
                                        options={{ maxFiles: 1 }}
                                        onUpload={uploadPhoto}
                                        uploadPreset="e0rggou2"
                                    >
                                        <Button icon={<FileAddOutlined />} className="bg-green-600 text-white hover:bg-blue-700 rounded-lg">
                                            Upload
                                        </Button>
                                    </CldUploadButton>

                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<SendOutlined />}
                                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                                >
                                    Gửi Email
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>

                <div className="flex-[30%] bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Danh sách Email</h3>

                    {/* Trường tìm kiếm */}
                    <Input
                        placeholder="Tìm kiếm email"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />

                    <Checkbox onChange={handleCheckAll} checked={allChecked}>Chọn tất cả</Checkbox>
                    <div className="flex gap-4 mt-4 overflow-y-auto max-h-[470px]">
                        <div className="w-1/2">
                            {filteredData.slice(0, Math.ceil(filteredData.length / 2)).map(user => (
                                <Checkbox
                                    key={user.email}
                                    onChange={() => handleCheckboxChange(user.email)}
                                    checked={selectedEmails.includes(user.email)}
                                >
                                    {user.email}
                                </Checkbox>
                            ))}
                        </div>
                        <div className="w-1/2">
                            {filteredData.slice(Math.ceil(filteredData.length / 2)).map(user => (
                                <Checkbox
                                    key={user.email}
                                    onChange={() => handleCheckboxChange(user.email)}
                                    checked={selectedEmails.includes(user.email)}
                                >
                                    {user.email}
                                </Checkbox>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendEmail;
