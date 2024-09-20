"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { DashboardOutlined, ClockCircleOutlined, UserOutlined, BookOutlined, FormOutlined, FileTextOutlined , MailFilled} from "@ant-design/icons";

const SideBar = () => {
  const pathname = usePathname();

  // Tạo class "active" nếu đường dẫn hiện tại khớp với danh sách đường dẫn menu
  const getIconStyle = (paths) => 
    paths.includes(pathname) ? { color: 'red' } : { color: 'gray' };

  return (
    <div className="flex flex-col gap-4 bg-white shadow-xl p-6 rounded-xl mt-3 h-[85vh] font-semibold overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ADMIN</h2>
      <Link href="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <DashboardOutlined style={{ fontSize: "20px" }} className="text-orange-500"/>
        <span style={getIconStyle(["/admin/dashboard", "/admin"])}>Dashboard</span>
      </Link>
      <Link href="/admin/work-hours" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <ClockCircleOutlined style={{ fontSize: "20px" }} className="text-yellow-500"/>
        <span style={getIconStyle(["/admin/work-hours"])}>Xem chi tiết</span>
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
        <FormOutlined style={{ fontSize: "20px" }} className="text-purple-500"/>
        <span style={getIconStyle(["/giaovu/pc-cham-thi"])}>Phân công chấm thi</span>
      </Link>
      <Link href="/giaovu/pc-huong dan" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FormOutlined style={{ fontSize: "20px" }} className="text-purple-500"/>
        <span style={getIconStyle(["/giaovu/pc-huong-dan"])}>Phân công hướng dẫn</span>
      </Link>
      <Link href="/giaovu/pc-ra-de" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <FileTextOutlined style={{ fontSize: "20px" }} className="text-teal-500"/>
        <span style={getIconStyle(["/giaovu/pc-ra-de"])}>Phân công ra đề</span>
      </Link>
      <Link href="/admin/email" className={`flex items-center gap-3 p-3 rounded-lg transition border-b-2`}>
        <MailFilled style={{ fontSize: "20px" }} className="text-teal-500"/>
        <span style={getIconStyle(["/giaovu/pc-ra-de"])}>Gửi Email</span>
      </Link>
    </div>
  );
};

export default SideBar;
