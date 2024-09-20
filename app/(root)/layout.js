import { Inter } from "next/font/google";
import "../globals.css";
import Provider from "@components/Provider";
import TopBar from "@components/TopBar";
import { Toaster } from "react-hot-toast"; // Import Toaster từ react-hot-toast

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hệ thống quản lý giờ lao động",
  description: "TRƯỜNG ĐẠI HỌC PHÚ YÊN ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-200`}>
        <Provider>
          <TopBar />
          {children}
          <Toaster /> {/* Thêm Toaster vào đây */}
        </Provider>
      </body>
    </html>
  );
}
