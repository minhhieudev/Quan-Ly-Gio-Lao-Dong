"use client";

import React from 'react';
import { Button, Space } from 'antd';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';


const WorkHours = () => {
  const router = useRouter();

  const handlePage = (type) => {
    router.push(`home/${type}`);
  };

  return (
    <div className=' bg-white rounded-xl h-[70vh] mx-auto w-[90%]  mt-6 max-sm:h-[70vh] shadow-xl'>
      <div className="flex items-center h-full ">
          <Space size="middle" className='flex flex-1 justify-around items-center flex-grow'>
            <Button
              className={`custom-button-1 button-chinh-quy`}
              onClick={() => handlePage('chinh-quy')}
            >
              <div className='text'>HỆ CHÍNH QUY</div>
            </Button>
            <Button
              className={`custom-button-1 button-chinh-quy-khac`}
              onClick={() => handlePage('lien-thong-vlvh')}
            >
              <div className='text'>LIÊN THÔNG <br /> VỪA LÀM VỪA HỌC</div>
            </Button>
            <Button
              className={`custom-button-1 button-boi-duong`}
              onClick={() => handlePage('boi-duong')}
            >
              <div className='text'>BỒI DƯỠNG</div>
            </Button>
          </Space>
      </div>
    </div>
  );
}

export default WorkHours;
