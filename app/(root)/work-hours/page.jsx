"use client";

import React, { useEffect, useState } from 'react';
import { Button, Space } from 'antd';
import { useRouter } from "next/navigation";

const WorkHours = () => {
  const router = useRouter();

  const handlePage = (type) => {
    router.push(`work-hours/${type}`);
  };

  return (
    <div className='p-4 bg-white rounded-xl w-[80%] h-[70vh] mx-auto flex items-center mt-6 max-sm:h-[70vh] shadow-xl'>
        <Space size="middle" className='flex flex-1 justify-around items-center max-md:flex-col'>
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
            <div className='text'>HỆ LIÊN THÔNG <br /> VỪA LÀM VỪA HỌC</div>
          </Button>
          <Button
            className={`custom-button-1 button-boi-duong`}
            onClick={() => handlePage('boi-duong')}
          >
            <div className='text'>BỒI DƯỠNG</div>
          </Button>
        </Space>
    </div>
  );
}

export default WorkHours;
