"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { 
  DashboardOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  BookOutlined, 
  FormOutlined,
  FileTextOutlined,
  MailFilled,
  TeamOutlined,
  BookFilled,
  ProfileOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  QuestionCircleOutlined,
  ApartmentOutlined,
  FileDoneOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  HistoryOutlined
} from "@ant-design/icons";

const SideBar = () => {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState({
    phanCong: true,
    quanLy: true,
    danhMuc: true,
    khac: true
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const getIconStyle = (paths) => {
    const pathname = usePathname();
    const isActive = paths.some(path => pathname.startsWith(path));
    return isActive ? { color: 'red' } : { color: 'black' };
  };

  const GroupHeader = ({ title, group, icon }) => (
    <div 
      onClick={() => toggleGroup(group)}
      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded-lg"
    >
      {icon}
      <span className="font-bold text-gray-700">{title}</span>
      {openGroups[group] ? <CaretDownOutlined /> : <CaretRightOutlined />}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 bg-white shadow-xl p-2 rounded-xl mt-1 h-[92vh] font-bold overflow-y-auto text-black text-[14px]">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ADMIN</h2>
      
      {/* Dashboard và Thống kê */}
      <Link href="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <DashboardOutlined style={{ fontSize: "20px" }} className="text-blue-600"/>
        <span style={getIconStyle(["/admin/dashboard"])}>Dashboard</span>
      </Link>
      <Link href="/admin/home" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <ClockCircleOutlined style={{ fontSize: "20px" }} className="text-green-600"/>
        <span style={getIconStyle(["/admin/home"])}>Thống kê lao động</span>
      </Link>

      {/* Nhóm Phân công */}
      <div className="border-t pt-2">
        <GroupHeader 
          title="CÔNG TÁC" 
          group="phanCong" 
          icon={<ScheduleOutlined className="text-orange-500"/>} 
        />
        {openGroups.phanCong && (
          <div className="ml-4 flex flex-col gap-2">
            <Link href="/admin/pc-giang-day" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <ScheduleOutlined style={{ fontSize: "20px" }} className="text-orange-500"/>
              <span style={getIconStyle(["/admin/pc-giang-day"])}>Giảng dạy</span>
            </Link>
            <Link href="/admin/pc-coi-thi" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <SafetyCertificateOutlined style={{ fontSize: "20px" }} className="text-indigo-500"/>
              <span style={getIconStyle(["/admin/pc-coi-thi"])}>Coi thi</span>
            </Link>
            <Link href="/admin/pc-cham-thi" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <FileProtectOutlined style={{ fontSize: "20px" }} className="text-red-500"/>
              <span style={getIconStyle(["/admin/pc-cham-thi"])}>Chấm thi</span>
            </Link>
            <Link href="/admin/kiem-nhiem" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <UserOutlined style={{ fontSize: "20px" }} className="text-indigo-500"/>
              <span style={getIconStyle(["/admin/kiem-nhiem"])}>Kiêm nhiệm</span>
            </Link>
            {/* <Link href="/admin/kiem-nhiem-backup" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <HistoryOutlined style={{ fontSize: "20px" }} className="text-blue-500"/>
              <span style={getIconStyle(["/admin/kiem-nhiem-backup"])}>Lịch sử kiêm nhiệm</span>
            </Link> */}
          </div>
        )}
      </div>

      {/* Nhóm Quản lý */}
      <div className="border-t pt-2">
        <GroupHeader 
          title="Quản lý" 
          group="quanLy" 
          icon={<TeamOutlined className="text-blue-500"/>} 
        />
        {openGroups.quanLy && (
          <div className="ml-4 flex flex-col gap-2">
            <Link href="/admin/user" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <TeamOutlined style={{ fontSize: "20px" }} className="text-blue-500"/>
              <span style={getIconStyle(["/admin/user"])}>Tài khoản</span>
            </Link>
            <Link href="/admin/khoa" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <BookFilled style={{ fontSize: "20px" }} className="text-yellow-600"/>
              <span style={getIconStyle(["/admin/khoa"])}>Khoa</span>
            </Link>
           
          </div>
        )}
      </div>

      {/* Nhóm Danh mục */}
      <div className="border-t pt-2">
        <GroupHeader 
          title="Danh mục" 
          group="danhMuc" 
          icon={<BookOutlined className="text-green-600"/>} 
        />
        {openGroups.danhMuc && (
          <div className="ml-4 flex flex-col gap-2">
            <Link href="/admin/ma-ngach" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <ProfileOutlined style={{ fontSize: "20px" }} className="text-purple-600"/>
              <span style={getIconStyle(["/admin/ma-ngach"])}>Mã ngạch</span>
            </Link>
            <Link href="/admin/hoc-phan" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <BookOutlined style={{ fontSize: "20px" }} className="text-green-600"/>
              <span style={getIconStyle(["/admin/hoc-phan"])}>Học phần TH</span>
            </Link>
            <Link href="/admin/chuc-vu" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <ApartmentOutlined style={{ fontSize: "20px" }} className="text-blue-600"/>
              <span style={getIconStyle(["/admin/chuc-vu"])}>Chức vụ / CV</span>
            </Link>
            <Link href="/admin/hinh-thuc-thi" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <FileTextOutlined style={{ fontSize: "20px" }} className="text-orange-500"/>
              <span style={getIconStyle(["/admin/hinh-thuc-thi"])}>Hình thức thi</span>
            </Link>
            <Link href="/admin/huong-dan" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <QuestionCircleOutlined style={{ fontSize: "20px" }} className="text-teal-500"/>
              <span style={getIconStyle(["/admin/huong-dan"])}>CV Hướng dẫn</span>
            </Link>
          </div>
        )}
      </div>

      {/* Nhóm Khác */}
      <div className="border-t pt-2">
        <GroupHeader 
          title="Khác" 
          group="khac" 
          icon={<FormOutlined className="text-gray-600"/>} 
        />
        {openGroups.khac && (
          <div className="ml-4 flex flex-col gap-2">
            <Link href="/admin/bieu-mau" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <FileDoneOutlined style={{ fontSize: "20px" }} className="text-pink-500"/>
              <span style={getIconStyle(["/admin/bieu-mau"])}>Biểu mẫu</span>
            </Link>
            <Link href="/admin/send-email" className={`flex items-center gap-3 p-2 rounded-lg transition`}>
              <MailFilled style={{ fontSize: "20px" }} className="text-cyan-600"/>
              <span style={getIconStyle(["/admin/send-email"])}>Gửi Email</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
