"use client";

import { useState, useEffect, useCallback } from "react";
import { Row, Col, Button, Input, Tabs, Spin, Select, Modal, Alert } from "antd";
import dayjs from "dayjs";
import TeachingForm from '@components/GiangDay/TeachingForm';
import EvaluationForm from "@components/ChamThi/EvaluationForm";
import DutyExemptionForm from "@components/KiemNhiem/DutyExemptionForm";
import ExamMonitoringForm from "@components/CoiThi/ExamMonitoringForm";
import ExamPreparationForm from "@components/ExamPreparationForm";
import GuidanceForm from "@components/HuongDan/GuidanceForm";
import TrainingTypeForm from "@components/TrainingTypeForm";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import toast from "react-hot-toast";
import { exportTongHopLaoDongForUser } from '@lib/fileExport';
import { getAcademicYearConfig } from '@lib/academicYearUtils';


const Pages = () => {
  const { type } = useParams();
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeKey, setActiveKey] = useState('');
  const [congTacGiangDay, setCongTacGiangDay] = useState({
    soTietLT: 0,
    soTietTH: 0,
    soTietQCLT: 0,
    soTietQCTH: 0,
    tong: 0,
  });
  const [congTacKhac, setCongTacKhac] = useState({
    chamThi: 0,
    ngoaiKhoa: 0,
    coiThi: 0,
    deThi: 0,
    tong: 0,
  });
  const [kiemNhiem, setKiemNhiem] = useState(0);
  const [isKiemNhiemCalculated, setIsKiemNhiemCalculated] = useState(false);
  const [kiemNhiemKey, setKiemNhiemKey] = useState(0);
  const router = useRouter();

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [kyHoc, setKyHoc] = useState("1");

  // Thêm state để lưu trạng thái
  const [recordStatus, setRecordStatus] = useState(null);

  // Get academic year configuration
  const { options: namHocOptions, defaultValue: defaultNamHoc } = getAcademicYearConfig();
  const [namHoc, setNamHoc] = useState(defaultNamHoc);

  const kyHocOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    // Thêm các kỳ khác nếu cần
  ];

  // State để lưu hạn nộp
  const [regulationRange, setRegulationRange] = useState({ start: null, end: null });

  // Lấy hạn nộp từ Setting
  useEffect(() => {
    const fetchRegulation = async () => {
      try {
        const res = await fetch("/api/admin/setting");
        const data = await res.json();
        if (data && data.length > 0) {
          setRegulationRange({
            start: data[0].startRegulation ? dayjs(data[0].startRegulation) : null,
            end: data[0].endRegulation ? dayjs(data[0].endRegulation) : null,
          });
        }
      } catch (err) {
        // Có thể show message lỗi nếu cần
      }
    };
    fetchRegulation();
  }, []);

  const [exportLoading, setExportLoading] = useState(false);
  const [allData, setAllData] = useState({
    info: null,
    data: {
      CongTacGiangDay: [],
      CongTacChamThi: [],
      CongTacCoiThi: [],
      CongTacHuongDan: [],
      CongTacKiemNhiem: [],
      CongTacRaDe: []
    }
  });

  const fetchAllData = async () => {
    setExportLoading(true); // Bắt đầu loading
    try {
      const res = await fetch(`/api/users/tong-hop-lao-dong/get-all/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(kyHoc)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setAllData(data);
        if (data) {
          exportTongHopLaoDongForUser(data, currentUser, namHoc, kiemNhiem)
        }
        toast.success("Xuất Excel thành công!");
      } else {
        toast.error("Không thể xuất Excel. Vui lòng thử lại!");
      }
    } catch (err) {
      console.log(err)
      toast.error("Đã xảy ra lỗi khi xuất Excel");
    } finally {
      setExportLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };
  const handleNamHocChange = (value) => {
    setNamHoc(value);
  };

  const handleKyHocChange = (value) => {
    setKyHoc(value);
  };

  useEffect(() => {
    const buttons = getButtonList();
    if (buttons.length > 0) {
      setSelectedForm(buttons[0]);
      setActiveKey(buttons[0]);
    }
  }, [type]);

  const getButtonList = () => {
    switch (type) {
      case 'boi-duong':
        return ['Công tác giảng dạy bồi dưỡng'];
      case 'chinh-quy':
        return [
          'Công tác kiêm nhiệm',
          'Công tác giảng dạy',
          'Công tác chấm thi',
          'Công tác hướng dẫn',
          'Công tác coi thi',
          'Công tác ra đề thi',

        ];
      default:
        return [
          'Công tác giảng dạy',
          'Công tác chấm thi',
          'Công tác hướng dẫn',
          'Công tác coi thi',
          'Công tác ra đề thi'
        ];
    }
  };

  const handleButtonClick = (key, formType) => {
    setSelectedForm(formType);
    setActiveKey(key);
  };

  const getButtonClass = (buttonText) => {
    switch (buttonText) {
      case 'Công tác giảng dạy':
        return 'button-dang-day';
      case 'Công tác chấm thi':
        return 'button-cham-thi';
      case 'Công tác hướng dẫn':
        return 'button-huong-dan';
      case 'Công tác coi thi':
        return 'button-coi-thi';
      case 'Công tác ra đề thi':
        return 'button-ra-de-thi';
      case 'Công tác kiêm nhiệm':
        return 'button-kiem-nhiem';
      case 'Công tác giảng dạy bồi dưỡng':
        return 'button-boi-duong';
      default:
        return '';
    }
  };
  const getTitle = () => {
    switch (type) {
      case 'chinh-quy':
        return 'CHÍNH QUY';
      case 'lien-thong-chinh-quy':
        return 'LIÊN THÔNG CHÍNH QUY';
      case 'lien-thong-vlvh':
        return 'LIÊN THÔNG VỪA LÀM VỪA HỌC';
      case 'lien-thong-vhvl-nd71':
        return 'LIÊN THÔNG VỪA LÀM VỪA HỌC - NĐ71';
      case 'boi-duong':
        return 'CÔNG TÁC GIẢNG DẠY - BỒI DƯỠNG';
      default:
        return '';
    }
  };

  const renderForm = () => {
    switch (selectedForm) {
      case 'Công tác kiêm nhiệm':
        return <DutyExemptionForm onUpdateCongTacKiemNhiem={updateCongTacKiemNhiem} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác giảng dạy':
        return <TeachingForm onUpdateCongTacGiangDay={updateCongTacGiangDay} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác chấm thi':
        return <EvaluationForm onUpdateCongTacChamThi={updateCongTacChamThi} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác hướng dẫn':
        return <GuidanceForm onUpdateCongTacHuongDan={updateCongTacHuongDan} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác coi thi':
        return <ExamMonitoringForm onUpdateCongTacCoiThi={updateCongTacCoiThi} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác ra đề thi':
        return <ExamPreparationForm onUpdateCongTacRaDe={updateCongTacRaDe} namHoc={namHoc || ''} ky={kyHoc || ''} />;
      case 'Công tác giảng dạy bồi dưỡng':
        return <TrainingTypeForm namHoc={namHoc || ''} ky={kyHoc || ''} />;
      default:
        return null;
    }
  };

  const updateCongTacGiangDay = useCallback((data) => {
    setCongTacGiangDay(data);
  }, []);

  // Hàm để tải dữ liệu giảng dạy từ API
  const fetchCongTacGiangDay = useCallback(async () => {
    if (!currentUser?._id || !namHoc || !type) return;

    try {
      const res = await fetch(`/api/work-hours/CongTacGiangDay/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}&ky=${encodeURIComponent(kyHoc || '')}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const totals = data.reduce((acc, item) => {
          acc.soTietLT += item.soTietLT || 0;
          acc.soTietTH += item.soTietTH || 0;
          acc.soTietQCLT += item.soTietQCLT || 0;
          acc.soTietQCTH += item.soTietQCTH || 0;
          acc.tong += item.tongCong || 0;
          return acc;
        }, { soTietLT: 0, soTietTH: 0, soTietQCLT: 0, soTietQCTH: 0, tong: 0 });

        setCongTacGiangDay(totals);
      }
    } catch (error) {
      console.error("Error fetching congTacGiangDay:", error);
    }
  }, [currentUser?._id, namHoc, type, kyHoc]);

  const updateCongTacChamThi = useCallback((data) => {
    setCongTacKhac(pre => ({
      ...pre,
      chamThi: data
    }));
  }, []);

  const updateCongTacHuongDan = useCallback((data) => {
    setCongTacKhac(pre => ({
      ...pre,
      ngoaiKhoa: data
    }));
  }, []);

  const updateCongTacRaDe = useCallback((data) => {
    setCongTacKhac(pre => ({
      ...pre,
      deThi: data
    }));
  }, []);

  const updateCongTacCoiThi = useCallback((data) => {
    setCongTacKhac(pre => ({
      ...pre,
      coiThi: data
    }));
  }, []);

  const updateCongTacKiemNhiem = useCallback((data) => {
    console.log("📥 Received kiem nhiem data in parent:", data);
    setKiemNhiem(data);
    setIsKiemNhiemCalculated(true); // Đánh dấu dữ liệu từ form
    setKiemNhiemKey(prev => prev + 1); // Buộc re-render
    console.log("✅ Updated kiemNhiem state to:", data, "(from form)");
  }, []);

  const submitResult = async () => {
    // Chỉ cho phép khi recordStatus là 10 (Chưa hoàn thành) hoặc 3 (Yêu cầu chỉnh sửa)
    if (recordStatus !== 10 && recordStatus !== 3) {
      toast.error("Chỉ được phép lưu khi trạng thái là 'Chưa hoàn thành' hoặc 'Yêu cầu chỉnh sửa'.");
      return;
    }
    // Kiểm tra hạn nộp
    const now = dayjs();
    if (regulationRange.end && now.isAfter(regulationRange.end, 'day')) {
      Modal.error({
        title: 'Quá hạn nộp!',
        content: (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Đã quá hạn nộp kết quả!"
              description={
                <div>
                  <div>Hạn cuối: <span className="font-bold text-red-600">{regulationRange.end.format('DD/MM/YYYY')}</span></div>
                  <div>Vui lòng liên hệ quản trị viên để được hỗ trợ.</div>
                </div>
              }
              type="error"
              showIcon
              style={{ marginTop: 10 }}
            />
          </div>
        ),
        okText: 'Đã hiểu',
        centered: true,
      });
      return;
    }
    Modal.confirm({
      title: "Xác nhận",
      content: "Kết quả sẽ được gửi đi. Bạn có chắc chắn không?",
      onOk: async () => {
        try {
          const res = await fetch(type !== "boi-duong" ? `/api/admin/tong-hop-lao-dong/chinh-quy/${type}` : "/api/admin/tong-hop-lao-dong/boi-duong", {
            method: "POST",
            body: JSON.stringify({
              user: currentUser._id,
              congTacGiangDay,
              congTacKhac: { ...congTacKhac, tong: congTacKhac.chamThi + congTacKhac.coiThi + congTacKhac.deThi + congTacKhac.ngoaiKhoa },
              kiemNhiem,
              loai: type,
              namHoc,
              // Luôn đặt trạng thái về 0 (Chờ duyệt) khi gửi lại
              trangThai: 0
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            toast.success("Lưu kết quả thành công !");
            // Cập nhật lại trạng thái hiển thị
            setRecordStatus(0);
            // onReset();
          } else {
            toast.error("Failed to save record");
          }
        } catch (err) {
          console.log('Err:', err);
          toast.error("An error occurred while saving data");
        }
      },
      onCancel() {
      },
    });
  };

  // Thêm hàm để lấy trạng thái hiện tại
  const fetchCurrentStatus = useCallback(async () => {
    if (!currentUser?._id || !namHoc || !type) return;

    try {
      const res = await fetch(`/api/work-hours/status?userId=${currentUser._id}&namHoc=${namHoc}&loai=${type}`);
      if (res.ok) {
        const data = await res.json();
        setRecordStatus(data.trangThai);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }, [currentUser, namHoc, type]);

  // Gọi hàm khi component mount hoặc các dependency thay đổi
  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus, namHoc, kyHoc]);

  // Hàm để hiển thị trạng thái dưới dạng text và màu sắc
  const renderStatusBadge = () => {
    if (recordStatus === null) return null;

    let statusText = "";
    let statusColor = "";
    let statusIcon = null;

    switch (recordStatus) {
      case 10:
        statusText = "Chưa hoàn thành";
        statusColor = "text-blue-500";
        statusIcon = <ClockCircleOutlined style={{ marginRight: 5 }} />;
        break;
      case 0:
        statusText = "Chờ duyệt";
        statusColor = "text-orange-600";
        statusIcon = <ClockCircleOutlined style={{ marginRight: 5 }} />;
        break;
      case 1:
        statusText = "Khoa đã duyệt";
        statusColor = "text-blue-600";
        statusIcon = <CheckCircleOutlined style={{ marginRight: 5 }} />;
        break;
      case 2:
        statusText = "Trường đã duyệt";
        statusColor = "text-green-600";
        statusIcon = <CheckCircleOutlined style={{ marginRight: 5 }} />;
        break;
      case 3:
        statusText = "Yêu cầu chỉnh sửa";
        statusColor = "text-red-600";
        statusIcon = <ExclamationCircleOutlined style={{ marginRight: 5 }} />;
        break;
      default:
        statusText = "Chưa hoàn thành";
        statusColor = "text-green-600";
        statusIcon = <ClockCircleOutlined style={{ marginRight: 5 }} />;
    }

    return (
      <div className={`font-bold ${statusColor} flex items-center`}>
        {statusIcon}
        {statusText}
      </div>
    );
  };

  // useEffect để tải dữ liệu giảng dạy khi cần thiết
  useEffect(() => {
    fetchCongTacGiangDay();
  }, [fetchCongTacGiangDay]);

  // Thêm useEffect để tải tất cả dữ liệu khi component mount
  useEffect(() => {
    if (!currentUser?._id || !namHoc) return;

    const fetchAllDataOnLoad = async () => {
      try {
        // Tải dữ liệu giảng dạy
        await fetchCongTacGiangDay();

        // Tải dữ liệu chấm thi
        const resChamThi = await fetch(`/api/work-hours/CongTacChamThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}&ky=${kyHoc || ''}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (resChamThi.ok) {
          const dataChamThi = await resChamThi.json();
          const totalChamThi = dataChamThi.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
          setCongTacKhac(prev => ({ ...prev, chamThi: totalChamThi }));
        }

        // Tải dữ liệu hướng dẫn
        const resHuongDan = await fetch(`/api/work-hours/CongTacHuongDan/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (resHuongDan.ok) {
          const dataHuongDan = await resHuongDan.json();
          const totalHuongDan = dataHuongDan.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
          setCongTacKhac(prev => ({ ...prev, ngoaiKhoa: totalHuongDan }));
        }

        // Tải dữ liệu coi thi
        const resCoiThi = await fetch(`/api/work-hours/CongTacCoiThi/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}&ky=${kyHoc || ''}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (resCoiThi.ok) {
          const dataCoiThi = await resCoiThi.json();
          const totalCoiThi = dataCoiThi.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
          setCongTacKhac(prev => ({ ...prev, coiThi: totalCoiThi }));
        }

        // Tải dữ liệu ra đề
        const resRaDe = await fetch(`/api/work-hours/CongTacRaDe/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}&ky=${kyHoc || ''}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (resRaDe.ok) {
          const dataRaDe = await resRaDe.json();
          const totalRaDe = dataRaDe.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
          setCongTacKhac(prev => ({ ...prev, deThi: totalRaDe }));
        }

        // Nếu là chính quy, tải dữ liệu kiêm nhiệm (chỉ khi chưa được tính toán từ form)
        if (type === 'chinh-quy') {
          const resKiemNhiem = await fetch(`/api/work-hours/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (resKiemNhiem.ok) {
            const dataKiemNhiem = await resKiemNhiem.json();
            const totalKiemNhiem = dataKiemNhiem.reduce((total, item) => total + (item.soTietQuyChuan || 0), 0);
            console.log("📊 Loaded kiem nhiem from API:", totalKiemNhiem, "isCalculated:", isKiemNhiemCalculated);

            // Chỉ cập nhật nếu dữ liệu chưa được tính toán từ form
            if (!isKiemNhiemCalculated) {
              setKiemNhiem(totalKiemNhiem);
              console.log("✅ Set kiem nhiem from API (not calculated yet)");
            } else {
              console.log("⏭️ Skip API data (already calculated from form)");
            }
          }
        }

      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };

    fetchAllDataOnLoad();
  }, [currentUser?._id, namHoc, type, kyHoc, fetchCongTacGiangDay]);

  return (
    <div className=" mx-auto px-2 py-2">
      <div className="mb-1 w-[100%] flex justify-between gap-3">
        <div className="w-[50%] flex bg-white items-center justify-between rounded-md">
          <Button
            className="button-kiem-nhiem text-white font-bold shadow-md ml-1"
            onClick={() => router.push(`/home`)}
            size="small"
          >
            <div className="hover:color-blue">
              <ArrowLeftOutlined style={{ color: 'white', fontSize: '18px' }} /> QUAY LẠI
            </div>
          </Button>
          <div className="flex-grow text-center rounded-xl font-bold mr-3 text-base-bold">
            {`HỆ ${getTitle()}`}
          </div>
        </div>
        <div className="w-[30%] px-2 bg-white rounded-md flex gap-2 items-center">
          <div className='text-base-bold'>Năm học:</div>
          <Select
            className="w-[60%]"
            value={namHoc}
            onChange={handleNamHocChange}
            options={namHocOptions}
            placeholder="Chọn năm học"
          />
        </div>
        <div className="w-[30%] px-2 bg-white rounded-md flex gap-2 items-center">
          <div className='text-base-bold'>Học kỳ:</div>
          <Select allowClear
            className="w-[60%]"
            value={kyHoc}
            onChange={handleKyHocChange}
            options={kyHocOptions}
            placeholder="Chọn học kỳ"
          />
        </div>
        {/* Hiển thị hạn nộp nếu có */}
        {regulationRange.start && regulationRange.end && (
          <div className="w-[30%] px-2 bg-white rounded-md flex items-center justify-center">
             <span>
              Hạn nộp -  <span className="font-semibold text-red-500">{regulationRange.end.format('DD/MM/YYYY')}</span>
            </span>
          </div>
        )}
        {/* Thêm trạng thái vào đây */}
        {recordStatus !== null && (
          <div className="w-[30%] px-2 bg-white rounded-md flex items-center justify-center">
            {renderStatusBadge()}
          </div>
        )}
        <Button
          className="button-lien-thong-vlvh text-white font-bold shadow-md mr-2"
          onClick={() => fetchAllData()}
          loading={exportLoading}
          disabled={exportLoading}
        >
          {!exportLoading && <FileExcelOutlined />}
          {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
        <Button
          className="bg-orange-600 text-white font-bold shadow-md"
          onClick={() => {
            console.log("🔄 Reset kiem nhiem calculation flag");
            setIsKiemNhiemCalculated(false);
            setKiemNhiem(0);
            setKiemNhiemKey(0);
          }}
        >
          🔄 Reset Data
        </Button>
      </div>

      {type !== 'boi-duong' && (
        <div className="px-2 py-1 bg-white w-[100%] rounded-xl shadow-md">
          <div className="flex space-x-4 justify-around items-center max-sm:flex-col max-sm:gap-4">
            {getButtonList().map((buttonText) => (
              <Button
                key={buttonText}
                className={`custom-button ${getButtonClass(buttonText)} ${activeKey === buttonText ? 'custom-button-active' : ''}`}
                onClick={() => handleButtonClick(buttonText, buttonText)}
              >
                {buttonText}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="py-1 w-full max-w-[100%] h-[67vh] overflow-auto max-sm:hidden">
        {renderForm()}
      </div>

      {type !== 'boi-duong' &&
        <div className="p-2 bg-white w-[100%] rounded-xl shadow-md">
          <div className="flex justify-around w-full flex-wrap">
            {type == 'chinh-quy' && (
              <div className="flex gap-2 justify-center" key={kiemNhiemKey}>
                <div className="font-bold">
                  KIÊM NHIỆM:
                </div>
                <p className="font-bold text-red-500" style={{color: kiemNhiem > 0 ? 'red' : 'red'}}>
                  {kiemNhiem || 0}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <div className="font-bold">
                GIẢNG DẠY:
              </div>
              <p className="font-bold text-red-500">{congTacGiangDay.tong}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <div className="font-bold">
                CHẤM THI:
              </div>
              <p className="font-bold text-red-500">{congTacKhac.chamThi}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <div className="font-bold">
                HƯỚNG DẪN:
              </div>
              <p className="font-bold text-red-500">{congTacKhac.ngoaiKhoa}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <div className="font-bold">
                COI THI:
              </div>
              <p className="font-bold text-red-500">{congTacKhac.coiThi}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <div className="font-bold">
                RA ĐỀ:
              </div>
              <p className="font-bold text-red-500">{congTacKhac.deThi}</p>
            </div>


          </div>
          <div className="text-center m-auto mt-3 ">
            <Button type="primary" htmlType="submit" onClick={submitResult} >
              Lưu kết quả
            </Button>
          </div>
        </div>
      }

    </div>
  );
};

export default Pages;
