"use client"
import React, { useState, useEffect } from "react";
import { Table, Select, Progress, Input } from "antd";
import {
    CheckCircleOutlined,
    CalendarOutlined,
    FolderOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Search } = Input;

const Dashboard = () => {

    const dataSource = [
        { key: "1", username: "John Doe", tongGioChinhQuy: 32, status: "10 Downing Street" },
        { key: "2", username: "Jane Smith", atongGioChinhQuyge: 28, status: "221B Baker Street" },
    ];

    const columns = [
        { title: "Họ tên giảng viên", dataIndex: "username", key: "username" },
        { title: "Tổng giờ", dataIndex: "tongGioChinhQuy", key: "tongGioChinhQuy" },
        { title: "Trạng thái", dataIndex: "status", key: "status" },
    ];

    const listNam = ["2023-2024", "2024-2025"];
    const listKhoa = ["Kỹ thuật công nghệ", "Khoa học tự nhiên", "Xã hội nhân văn", "Nông nghiêp", "Mầm non"];

    const [selectedKhoa, setSelectedKhoa] = useState(null);
    const [hocKy, setHocKy] = useState(null);

    const [khoaList, setKhoaList] = useState([]);

    const fetchKhoaData = async () => {
        try {
            const res = await fetch(`/api/admin/khoa`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Khoa List:', data);
                setKhoaList(data);
            } else {
                toast.error("Failed to fetch khoa data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching khoa data");
        }
    };

    useEffect(() => {
        fetchKhoaData();
    }, []);

    const progressData = {
        "Kỹ thuật - Công nghệ": { current: 10, total: 10 },
        "Sư phạm": { current: 8, total: 12 },
        "Xã hội - Nhân văn": { current: 0, total: 5 },
        "Giáo dục Mầm non": { current: 0, total: 5 },
        "Nông nghiệp": { current: 0, total: 5 },
    };

    const handleSelectKhoa = (khoa) => {
        setSelectedKhoa(khoa);
    };

    return (
        <div className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-xl flex items-center">
                    <CalendarOutlined style={{ fontSize: "90px" }} className="mr-4 text-blue-500" />
                    <div className="text-base-bold space-y-3">
                        <div className="flex gap-3 ">
                            <p>Năm học: </p>
                            <h2 className="text-xl font-bold mb-0 flex-grow">
                                <Select onChange={(value) => setNamHoc(value)} defaultValue={"2024-2025"} style={{ width: 120 }} allowClear>
                                    {["2021-2022", "2022-2023", "2023-2024", "2024-2025"].map((nam, index) => (
                                        <Option key={index} value={nam}>
                                            {nam}
                                        </Option>
                                    ))}
                                </Select>
                            </h2>
                        </div>
                        <div className="flex gap-3">
                            <p>Học kỳ: </p>
                            <h2 className="text-xl font-bold mb-0">
                                <Select onChange={(value) => setHocKy(value)} className="font-bold" value={hocKy} style={{ width: 120 }} allowClear>
                                    {["1", "2"].map((nam, index) => (
                                        <Option key={index} value={nam}>
                                            {nam}
                                        </Option>
                                    ))}
                                </Select>
                            </h2>
                        </div>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg shadow-xl flex items-center justify-between">
                    <div className="flex items-center">
                        <CheckCircleOutlined style={{ fontSize: "90px" }} className="mr-4 text-green-500" />
                        <div>
                            <h2 className="text-xl font-bold mb-2">55/600</h2>
                            <p>Đã hoàn thành</p>
                        </div>
                    </div>
                    <Progress
                        type="dashboard"
                        steps={8}
                        percent={50}
                        trailColor="rgba(0, 0, 0, 0.06)"
                        strokeWidth={20}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-xl flex items-center justify-between">
                    <div className="flex items-center">
                        <FolderOutlined style={{ fontSize: "90px" }} className="mr-4 text-purple-500" />
                        <div>
                            <h2 className="text-xl font-bold mb-2">Box 3</h2>
                            <p>Some content here...</p>
                        </div>
                    </div>
                    <Progress
                        type="dashboard"
                        steps={10}
                        percent={50}
                        trailColor="rgba(0, 0, 0, 0.06)"
                        strokeWidth={20}
                    />
                </div>
            </div>

            <div className="grid grid-cols-5 gap-6 h-full">
                <div className="col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-bold mb-4">Danh sách</h2>
                        <Search
                            placeholder="input search text"
                            allowClear
                            enterButton="Search"
                            size="small"
                            style={{
                                width: 250,
                            }}
                        // onSearch={onSearch}
                        />
                    </div>
                    <Table dataSource={dataSource} columns={columns} pagination={false} />
                </div>


                <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Danh sách các khoa</h2>
                    <div className="list-disc max-h-[45vh] overflow-y-auto">
                        {khoaList.map((khoa, index) => (
                            <div
                                key={index}
                                className={`mb-4 p-4 cursor-pointer border-2 rounded-lg ${selectedKhoa === khoa ? "bg-blue-100 border border-blue-500" : "bg-white"
                                    }`}
                                onClick={() => handleSelectKhoa(khoa)}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{khoa.tenKhoa}</span>
                                    <span className="text-red-500">
                                        {progressData[khoa.tenKhoa]?.current}/{progressData[khoa.tenKhoa]?.total}
                                    </span>
                                </div>
                                <Progress
                                    percent={Math.round((progressData[khoa.tenKhoa]?.current / progressData[khoa.tenKhoa]?.total) * 100)}
                                    className="mt-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


// Hỏi chỗ user ở mấy cái select 