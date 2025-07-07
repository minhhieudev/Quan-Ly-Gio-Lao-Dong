"use client";

import React from 'react';
import { Button } from 'antd';
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeftOutlined } from '@ant-design/icons';

const WorkHours = () => {
    const { type, id } = useParams();
    const router = useRouter();

    const handlePage = (type) => {
        router.push(`/home/${type}`);
    };

    const getButtonList = () => {
        switch (type) {
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
            default:
                return '';
        }
    };

    const getTypeForm = (buttonText) => {
        switch (buttonText) {
            case 'Công tác giảng dạy':
                return 'CongTacGiangDay';
            case 'Công tác chấm thi':
                return 'CongTacChamThi';
            case 'Công tác hướng dẫn':
                return 'CongTacHuongDan';
            case 'Công tác coi thi':
                return 'CongTacCoiThi';
            case 'Công tác ra đề thi':
                return 'CongTacRaDe';
            case 'Công tác kiêm nhiệm':
                return 'CongTacKiemNhiem';
            default:
                return '';
        }
    };

    return (
        <div className='m-auto w-[99%] h-[80vh] max-sm:h-fit shadow-xl bg-white mt-4 rounded-md p-2'>
            <Button
                className="button-kiem-nhiem text-white font-bold shadow-md mr-2"
                onClick={() => router.push(`/admin/home/${type}`)}
            >
                <ArrowLeftOutlined
                    style={{
                        color: 'white',
                        fontSize: '18px',
                    }}
                /> QUAY LẠI
            </Button>
            <div className='rounded-xl flex justify-center items-center gap-20 flex-wrap w-[95%] mx-auto  mt-7'>
                {getButtonList().map((buttonText) => (
                    <Button
                        key={buttonText}
                        className={`custom-button-1 text-heading3-bold ${getButtonClass(buttonText)}`}
                        onClick={() => router.push(`./detail/${getTypeForm(buttonText)}`)}
                    >
                        {buttonText}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default WorkHours;
