"use client";

import { useState, useEffect, useCallback } from "react";
import { Row, Col, Button, Input, Tabs, Spin, Select } from "antd";
import TeachingForm from '@components/GiangDay/TeachingForm';
import EvaluationForm from "@components/ChamThi/EvaluationForm";
import DutyExemptionForm from "@components/DutyExemptionForm";
import ExamMonitoringForm from "@components/CoiThi/ExamMonitoringForm";
import ExamPreparationForm from "@components/ExamPreparationForm";
import GuidanceForm from "@components/GuidanceForm";
import TrainingTypeForm from "@components/TrainingTypeForm";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from '@ant-design/icons';
import toast from "react-hot-toast";

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
  const [namHoc, setNamHoc] = useState("2024-2025");
  const router = useRouter();

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [kyHoc, setKyHoc] = useState("1");

  // Option lists
  const namHocOptions = [
    { value: '2021-2022', label: '2021 - 2022' },
    { value: '2022-2023', label: '2022 - 2023' },
    { value: '2023-2024', label: '2023 - 2024' },
    { value: '2024-2025', label: '2024 - 2025' },
  ];

  const kyHocOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    // Thêm các kỳ khác nếu cần
  ];

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
          'Công tác giảng dạy',
          'Công tác chấm thi',
          'Công tác hướng dẫn',
          'Công tác coi thi',
          'Công tác ra đề thi',
          'Công tác kiêm nhiệm'
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
      case 'Công tác giảng dạy':
        return <TeachingForm onUpdateCongTacGiangDay={updateCongTacGiangDay} namHoc={namHoc || ''} ky={kyHoc||''} />;
      case 'Công tác chấm thi':
        return <EvaluationForm onUpdateCongTacChamThi={updateCongTacChamThi} namHoc={namHoc || ''} ky={kyHoc||''}/>;
      case 'Công tác hướng dẫn':
        return <GuidanceForm onUpdateCongTacHuongDan={updateCongTacHuongDan} namHoc={namHoc || ''} />;
      case 'Công tác coi thi':
        return <ExamMonitoringForm onUpdateCongTacCoiThi={updateCongTacCoiThi} namHoc={namHoc || ''} ky={kyHoc||''}/>;
      case 'Công tác ra đề thi':
        return <ExamPreparationForm onUpdateCongTacRaDe={updateCongTacRaDe} namHoc={namHoc || ''} ky={kyHoc||''}/>;
      case 'Công tác kiêm nhiệm':
        return <DutyExemptionForm onUpdateCongTacKiemNhiem={updateCongTacKiemNhiem} namHoc={namHoc || ''} />;
      case 'Công tác giảng dạy bồi dưỡng':
        return <TrainingTypeForm namHoc={namHoc || ''} />;
      default:
        return null;
    }
  };

  const updateCongTacGiangDay = useCallback((data) => {
    setCongTacGiangDay(data);
  }, []);

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
    setKiemNhiem(data);
  }, []);

  const submitResult = async () => {
    try {
      const res = await fetch(type !== "boi-duong" ? `/api/admin/tong-hop-lao-dong/chinh-quy/${type}` : "/api/admin/tong-hop-lao-dong/boi-duong", {
        method: "POST",
        body: JSON.stringify({
          user: currentUser._id,
          congTacGiangDay,
          congTacKhac: { ...congTacKhac, tong: congTacKhac.chamThi + congTacKhac.coiThi + congTacKhac.deThi + congTacKhac.ngoaiKhoa },
          kiemNhiem,
          loai: type,
          namHoc
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Lưu kết quả thành công !");
        // onReset();
      } else {
        toast.error("Failed to save record");
      }
    } catch (err) {
      console.log('Err:', err)
      toast.error("An error occurred while saving data");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-1 h-[20%]">
      <div className=" mb-1 w-[98%]  flex justify-between gap-3">
        <div className="w-[70%]  flex bg-white items-center justify-between rounded-md">
          <Button
            className="button-kiem-nhiem text-white font-bold shadow-md ml-1"
            onClick={() => router.push(`/work-hours`)}
            size="small"
          >
            <div className="hover:color-blue "><ArrowLeftOutlined
              style={{
                color: 'white',
                fontSize: '18px',
              }}
            /> QUAY LẠI</div>
          </Button>
          <div className="flex-grow text-center rounded-xl font-bold mr-3">
            {`HỆ ${getTitle()}`}
          </div>
        </div>
        <div className="w-[30%]  px-2 bg-white rounded-md flex gap-2 items-center">
          <div className='text-base-bold'>Năm học :</div>
          <Select
            className="w-[60%]"
            value={namHoc}
            onChange={handleNamHocChange}
            options={namHocOptions}
            placeholder="Chọn năm học"
          />
        </div>
        <div className="w-[30%]  px-2 bg-white rounded-md flex gap-2 items-center">
          <div className='text-base-bold'>Kỳ học:</div>
          <Select allowClear
            className="w-[60%]"
            value={kyHoc}
            onChange={handleKyHocChange}
            options={kyHocOptions}
            placeholder="Chọn kỳ học"
          />
        </div>
      </div>

      {type !== 'boi-duong' && (
        <div className="px-2 py-1 bg-white w-[98%] rounded-xl shadow-md">
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

      <div className="py-1 w-[98%] h-[67vh] max-sm:hidden">
            {renderForm()}
      </div>

      {type !== 'boi-duong' &&
        <div className="p-2 bg-white w-[98%] rounded-xl shadow-md">
          <div className="flex justify-around w-full flex-wrap">
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

            {type == 'chinh-quy' && (
              <div className="flex gap-2 justify-center">
                <div className="font-bold">
                  KIÊM NHIỆM:
                </div>
                <p className="font-bold text-red-500">{kiemNhiem}</p>
              </div>
            )}
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
