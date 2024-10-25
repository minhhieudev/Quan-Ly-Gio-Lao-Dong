"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { DashboardOutlined, ClockCircleOutlined, UserOutlined, BookOutlined, FormOutlined, FileTextOutlined , MailFilled} from "@ant-design/icons";

const SideBar = () => {
  const pathname = usePathname();

  // Tạo class "active" nếu đường dẫn hiện tại khớp với danh sách đường dẫn menu
  const getIconStyle = (paths) => 
    paths.includes(pathname) ? { color: 'red' } : { color: 'black' };

  return (
    <div className="flex flex-col gap-5 bg-white shadow-xl p-2 rounded-xl mt-1 h-[92vh] font-bold overflow-y-auto text-black text-[14px]">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ADMIN</h2>
      <Link href="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <DashboardOutlined style={{ fontSize: "20px" }} className="text-orange-500"/>
        <span style={getIconStyle(["/admin/dashboard", "/admin"])}>Dashboard</span>
      </Link>
      <Link href="/admin/work-hours" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <ClockCircleOutlined style={{ fontSize: "20px" }} className="text-yellow-500"/>
        <span style={getIconStyle(["/admin/work-hours"])}>Thống kê lao động</span>
      </Link>
      <Link href="/admin/user" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <UserOutlined style={{ fontSize: "20px" }} className="text-blue-500"/>
        <span style={getIconStyle(["/admin/user"])}>User</span>
      </Link>
      <Link href="/admin/khoa" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <BookOutlined style={{ fontSize: "20px" }} className="text-green-500"/>
        <span style={getIconStyle(["/admin/khoa"])}>Khoa</span>
      </Link>
      <Link href="/giaovu/pc-giang-day" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-purple-500"/>
        <span style={getIconStyle(["/giaovu/pc-giang-day"])}>Phân công giảng dạy</span>
      </Link>
      <Link href="/giaovu/pc-coi-thi" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-purple-500"/>
        <span style={getIconStyle(["/giaovu/pc-coi-thi"])}>Phân công coi thi</span>
      </Link>
      <Link href="/giaovu/pc-cham-thi" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-pink-500"/>
        <span style={getIconStyle(["/giaovu/pc-cham-thi"])}>Phân công chấm thi</span>
      </Link>
      <Link href="/admin/ma-ngach" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-blue-500"/>
        <span style={getIconStyle(["/admin/ma-ngach"])}>Mã ngạch</span>
      </Link>
      <Link href="/admin/chuc-vu" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-purple-500"/>
        <span style={getIconStyle(["/admin/chuc-vu"])}>Chức vụ</span>
      </Link>
      <Link href="/admin/send-email" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <MailFilled style={{ fontSize: "20px" }} className="text-teal-500"/>
        <span style={getIconStyle(["/giaovu/pc-ra-de"])}>Gửi Email</span>
      </Link>
    </div>
  );
};

export default SideBar;
