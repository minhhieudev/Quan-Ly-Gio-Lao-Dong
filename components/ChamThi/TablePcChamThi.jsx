"use client";

import { Button, Modal, Pagination, Spin, Table } from "antd";
import { SwapOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const TablePcChamThi = ({
  namHoc,
  ky,
  listSelect,
  type,
  onDataChange,
  onSwitchTab,
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [listOptions, setListOptions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Kết quả chấm thi");

  const getGV = (gv1, gv2) => {
    if (gv1 == currentUser?.username) {
      return "1";
    } else if (gv2 == currentUser?.username) {
      return "2";
    } else {
      return "";
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/hinh-thuc-thi`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setListOptions(data);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    }
  };

  const handleChuyenKetQua = async () => {
    if (!listSelect || listSelect.length === 0) {
      toast.error("Không có dữ liệu để chuyển!");
      return;
    }

    if (!session?.user) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận chuyển dữ liệu",
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn chuyển dữ liệu sang Kết quả chấm thi?</p>
          <p className="mt-2 text-blue-600 font-medium">Thông tin chuyển:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Năm học: {namHoc}</li>
            <li>Kỳ: {ky}</li>
            <li>Số lượng: {listSelect.length} bản ghi</li>
          </ul>
          <p className="mt-2 text-red-500">
            Lưu ý: Dữ liệu trùng lặp sẽ được cập nhật!
          </p>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setProcessing(true);

          // Xử lý dữ liệu từ listSelect để tạo dữ liệu phù hợp cho bảng kết quả
          const ketQuaData = listSelect.map((item) => ({
            hocPhan: item.hocPhan,
            lopHocPhan: item.nhomLop,
            canBoChamThi: getGV(item.cb1, item.cb2),
            soBaiCham: item.soBai,
            soTietQuyChuan: handleSelectChange2(item),
            hinhThuc: item.hinhThuc,
            thoiGian: item.thoiGian,
            namHoc: namHoc,
            ky: ky,
            type: type,
            user: session.user._id,
          }));

          // Gọi API để lưu dữ liệu
          const response = await fetch("/api/giaovu/pc-cham-thi/create-many", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: ketQuaData }),
          });

          if (response.ok) {
            toast.success(
              "Đã chuyển dữ liệu sang Kết quả chấm thi thành công!"
            );
            if (onDataChange) {
              await onDataChange(); // ✅ gọi lại fetchCongTacChamThi() ở EvaluationForm
            }

            if (onSwitchTab) {
              onSwitchTab();
            }
          } else {
            throw new Error("Lỗi khi chuyển dữ liệu");
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Có lỗi xảy ra khi chuyển dữ liệu!");
        } finally {
          setProcessing(false);
        }
      },
    }); // ✅ đóng Modal.confirm
  };

  const handleSelectChange2 = (item2) => {
    const selected = listOptions.find(
      (item) => item?.ten.toLowerCase() == item2.hinhThuc?.toLowerCase()
    );

    if (selected) {
      const values = (
        (item2.soBai * selected.soGio) /
        selected.soLuong
      ).toFixed(3);
      return values;
    } else {
      return 0;
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      width: 10,
      render: (text, record, index) => (
        <span style={{ fontWeight: "bold" }}>{index + 1}</span>
      ),
    },
    {
      title: "Học phần",
      dataIndex: "hocPhan",
      key: "hocPhan",
      render: (text) => (
        <span style={{ color: "green", fontWeight: "bold" }}>{text}</span>
      ),
    },
    {
      title: "Nhóm/Lớp",
      dataIndex: "nhomLop",
      key: "nhomLop",
      render: (text) => (
        <span style={{ color: "red", fontWeight: "bold" }}>{text}</span>
      ),
    },
    {
      title: "Ngày thi",
      dataIndex: "ngayThi",
      key: "ngayThi",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "Cán bộ 1",
      dataIndex: "cb1",
      key: "cb1",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: "blue" }}>{text}</span>
      ),
    },
    {
      title: "Cán bộ 2",
      dataIndex: "cb2",
      key: "cb2",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: "blue" }}>{text}</span>
      ),
    },
    {
      title: "Số bài",
      dataIndex: "soBai",
      key: "soBai",
      width: 20,
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "HT",
      dataIndex: "hinhThuc",
      key: "hinhThuc",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
      width: 20,
    },
    {
      title: "TG",
      dataIndex: "thoiGian",
      key: "thoiGian",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
      width: 20,
    },
  ];

  // Phân trang dữ liệu
  const paginatedData = listSelect.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          onClick={handleChuyenKetQua}
          loading={processing}
          className="bg-green-500 hover:bg-green-600"
          icon={<SwapOutlined />}
        >
          Chuyển kết quả chấm thi
        </Button>
      </div>
      {loading ? (
        <div className="mx-auto text-center w-full">
          <Spin />
        </div>
      ) : (
        <div
          className="flex-grow overflow-auto"
          style={{ maxHeight: "calc(85vh - 290px)" }}
        >
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false} // Tắt phân trang trên Table
          />
        </div>
      )}

      <div className="mt-2 ">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={listSelect.length}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          pageSizeOptions={["5", "10", "25", "50", "100"]}
          showSizeChanger
          className="flex justify-end"
        />
      </div>
    </div>
  );
};

export default TablePcChamThi;
