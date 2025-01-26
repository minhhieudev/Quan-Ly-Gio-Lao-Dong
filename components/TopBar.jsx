"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Logout } from "@mui/icons-material";


const TopBar = () => {

  const handleLogout = async () => {
    signOut({ callbackUrl: "/" });
  };

  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="topbar">
      <div className="flex items-center gap-2">
        <Link href="/chats">
          <img src="https://upload.wikimedia.org/wikipedia/vi/2/2e/Dai_hoc_phu_yen_logo.png" alt="logo" className="logo" />
        </Link>
        <div className="max-sm:hidden">
          <div className="text-bold font-bold">TRƯỜNG ĐẠI HỌC PHÚ YÊN</div>
          <p className="font-bold text-[12px]">HỆ THỐNG QUẢN LÝ GIỜ LAO ĐỘNG</p>
        </div>
      </div>

      <div className="menu">
        <div className="text-bold font-bold text-green-500">{user?.username}</div>

        <Logout
          sx={{ color: "#737373", cursor: "pointer" }}
          onClick={handleLogout}
        />
        <Link href="/profile">
          <img
            src={user?.profileImage || "/assets/person.jpg"}
            alt="profile"
            className="profilePhoto"
          />
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
