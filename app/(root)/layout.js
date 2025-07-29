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
          <div className="container mx-auto max-w-[1600px] px-2 min-h-screen">
            <TopBar />
            {children}
          </div>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '14px',
                maxWidth: '350px',
              },
              success: {
                style: {
                  background: '#EBF7EE',
                  border: '1px solid #4CAF50',
                  color: '#1E4620',
                },
                icon: '✓',
              },
              error: {
                style: {
                  background: '#FEECEB',
                  border: '1px solid #F44336',
                  color: '#5F2120',
                },
                icon: '✕',
              },
              loading: {
                style: {
                  background: '#E3F2FD',
                  border: '1px solid #2196F3',
                  color: '#0D3C61',
                },
              },
            }}
          />
        </Provider>
      </body>
    </html>
  );
}
