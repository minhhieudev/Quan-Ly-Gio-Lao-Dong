"use client"
import React, { useState, useEffect } from "react";
import { Table, Select, Progress, Input, Spin } from "antd";
import {
    CheckCircleOutlined,
    CalendarOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { getAcademicYearConfig } from '@lib/academicYearUtils';

const { Option } = Select;
const { Search } = Input;

const Dashboard = () => {
    // Get academic year configuration
    const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();

    const columns = [
        { title: "Họ tên giảng viên", dataIndex: "username", key: "username", className: 'text-blue-500 font-bold' },
        { title: "Tổng giờ", dataIndex: "tongGioChinhQuy", key: "tongGioChinhQuy", className: 'text-red-500 font-bold' },
    ];

    const [selectedKhoa, setSelectedKhoa] = useState(null);
    const [hocKy, setHocKy] = useState(null);

    const [khoaList, setKhoaList] = useState([]);
    const [dataList, setDataList] = useState([]);
    const [dataTable, setDataTable] = useState([]);
    const [dataCount, setDataCount] = useState([]);
    const [namHoc, setNamHoc] = useState(defaultNamHoc);

    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchKhoaData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/khoa`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setKhoaList(data);
            } else {
                toast.error("Failed to fetch khoa data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching khoa data");
        }
    };
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/dashboard/get-complete?namHoc=${namHoc}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataList(data);
            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };
    const fetchDataCount = async () => {
        try {
            const res = await fetch(`/api/admin/dashboard/get-count?namHoc=${namHoc}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setDataCount(data);
            } else {
                toast.error("Failed to fetch count data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching count data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchKhoaData(),
                fetchData(),
                fetchDataCount()
            ]);
            setLoading(false);
        };

        fetchAllData();
    }, [namHoc]);

    const handleSelectKhoa = (khoa) => {
        setSelectedKhoa(khoa);
        // Lấy listGV của khoa được chọn và cập nhật vào dataTable
        const selectedKhoaData = dataList[khoa.tenKhoa]?.listGV || [];
        setDataTable(selectedKhoaData);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            // Nếu không có text tìm kiếm, hiển thị lại toàn bộ data của khoa đang chọn
            setFilteredData(dataTable);
            return;
        }

        // Lọc data theo username
        const filtered = dataTable.filter(item =>
            item.username.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    useEffect(() => {
        // Cập nhật filteredData mỗi khi dataTable thay đổi
        setFilteredData(dataTable);
    }, [dataTable]);

    return (
        <Spin spinning={loading} tip="Loading...">
            <div className="p-2">
                <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="bg-white p-4 rounded-lg shadow-xl flex items-center">
                        <CalendarOutlined style={{ fontSize: "90px" }} className="mr-4 text-blue-500" />
                        <div className="text-base-bold space-y-3">
                            <div className="flex gap-3 ">
                                <p>Năm học: </p>
                                <h2 className="text-xl font-bold mb-0 flex-grow">
                                    <Select onChange={(value) => setNamHoc(value)} defaultValue={defaultNamHoc} style={{ width: 120 }} allowClear>
                                        {namHocOptions.map((option, index) => (
                                            <Option key={index} value={option.value}>
                                                {option.label}
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
                                <h2 className="text-xl font-bold mb-2">{dataCount.completed}/{dataCount.total}</h2>
                                <p>Đã thực hiện</p>
                            </div>
                        </div>
                        <Progress
                            type="dashboard"
                            percent={Math.round((dataCount.completed / dataCount.total) * 100)}
                            trailColor="rgba(0, 0, 0, 0.06)"
                            strokeWidth={20}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <CloseCircleOutlined style={{ fontSize: "90px" }} className="mr-4 text-red-500" />
                            <div>
                                <h2 className="text-xl font-bold mb-2">{dataCount.notCompleted}/{dataCount.total}</h2>
                                <p>Chưa thực hiện</p>
                            </div>
                        </div>
                        <Progress
                            type="dashboard"
                            percent={Math.round((dataCount.notCompleted / dataCount.total) * 100)}
                            status="exception"
                            trailColor="rgba(0, 0, 0, 0.06)"
                            strokeWidth={20}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-3 ">
                    <div className="col-span-3 bg-white p-3 rounded-lg shadow-md h-[65vh]">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold mb-3">Danh sách</h2>
                            <Search
                                placeholder="Tìm kiếm theo tên..."
                                allowClear
                                enterButton="Search"
                                size="small"
                                style={{
                                    width: 250,
                                }}
                                onSearch={handleSearch}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex-grow overflow-auto" style={{ maxHeight: 'calc(85vh - 270px)' }}>
                            <Table
                                dataSource={filteredData}
                                columns={columns}
                                pagination={false}
                            />
                        </div>
                    </div>


                    <div className="col-span-2 bg-white p-3 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Danh sách các khoa</h2>
                        <div className="list-disc max-h-[56vh] overflow-y-auto">
                            {khoaList.map((khoa, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 p-4 cursor-pointer border-4 rounded-lg ${selectedKhoa === khoa ? "bg-blue-100 border-4 border-blue-500" : "bg-white"
                                        }`}
                                    onClick={() => handleSelectKhoa(khoa)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-green-500">{khoa.tenKhoa}</span>
                                        <span className="text-red-500">
                                            {dataList[khoa.tenKhoa]?.current}/{dataList[khoa.tenKhoa]?.total}
                                        </span>
                                    </div>
                                    <Progress
                                        percent={Math.round((dataList[khoa.tenKhoa]?.current / dataList[khoa.tenKhoa]?.total) * 100)}
                                        className="mt-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default Dashboard;


