"use client";

import { SaveOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Form, Popconfirm, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../Loader";
import TableKiemNhiem from "./TableKiemNhiem";

const { Title } = Typography;
const { TabPane } = Tabs;

const formSchema = {
    chucVu: "",
    startTime: "",
    user: "",
    endTime: "",
    ghiChu: ''
};


const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const DutyExemptionForm = ({ onUpdateCongTacKiemNhiem, namHoc, ky }) => {
    const [dataList, setDataList] = useState([]);
    const [dataList2, setDataList2] = useState([]);
    const [editRecord, setEditRecord] = useState(null); // For PHỤ LỤC CÔNG VIỆC
    const [editRecordDaLuu, setEditRecordDaLuu] = useState(null); // For DANH SÁCH ĐÃ LƯU
    const [editSource, setEditSource] = useState(null); // 'phu-luc' | 'da-luu' | null
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6); // Sửa lại, không phải const
    const [loadings, setLoadings] = useState(true);
    const [dataListSelect, setDataListSelect] = useState([]);
    const [dataListSelect2, setDataListSelect2] = useState([]);
    const [dataListSelect3, setDataListSelect3] = useState([]);
    const [mienGiam, setMienGiam] = useState(0);
    const [mienGiam2, setMienGiam2] = useState(0);
    const [dataTong, setDataTong] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Danh sách công việc');
    const [resultsDisplay, setResultsDisplay] = useState([]);
    const [finalResult, setFinalResult] = useState(0);
    const [editableTotal, setEditableTotal] = useState(null);
    const [isEditingTotal, setIsEditingTotal] = useState(false);

    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formSchema,
    });

    const { data: session } = useSession();
    const currentUser = session?.user;

    const { type } = useParams();

    const [loading, setLoading] = useState(false);

    const [schoolYearStart, setSchoolYearStart] = useState(null);
    const [schoolYearEnd, setSchoolYearEnd] = useState(null);
    const [listChucVu, setListChucVu] = useState([]);
    const [listUser, setListUser] = useState([]);

    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                const res = await fetch('/api/admin/setting');
                const data = await res.json();
                if (data && data.length > 0) {
                    const startDate = data[0].schoolYearStart ? dayjs(data[0].schoolYearStart) : null;
                    const endDate = data[0].schoolYearEnd ? dayjs(data[0].schoolYearEnd) : null;
                    setSchoolYearStart(startDate);
                    setSchoolYearEnd(endDate);

                    // Set default startTime to schoolYearStart
                    if (startDate) {
                        setValue('startTime', startDate);
                    }
                }
            } catch (err) {
                // Có thể show message lỗi nếu cần
            }
        };
        fetchSchoolYear();
    }, [setValue]);

    // Set default user to current user
    useEffect(() => {
        if (currentUser?._id) {
            setValue('user', currentUser._id);
        }
    }, [currentUser, setValue]);

    // For PHỤ LỤC CÔNG VIỆC form
    useEffect(() => {
        if (editSource === 'phu-luc') {
            if (editRecord) {
                reset(editRecord);
            } else {
                reset(formSchema);
            }
        }
    }, [editRecord, editSource, reset]);

    // For DANH SÁCH ĐÃ LƯU form
    const [formDaLuu, setFormDaLuu] = useState(formSchema);
    useEffect(() => {
        if (editSource === 'da-luu') {
            if (editRecordDaLuu) {
                setFormDaLuu(editRecordDaLuu);
            } else {
                setFormDaLuu(formSchema);
            }
        }
    }, [editRecordDaLuu, editSource]);

    const tyLeMienGiam = useWatch({ control, name: "tyLeMienGiam" });

    useEffect(() => {
        if (!currentUser?.maNgachInfo?.GCGD) return;
        let result;
        if (tyLeMienGiam < 1) {
            result = currentUser.maNgachInfo.GCGD * tyLeMienGiam;
        } else {
            result = tyLeMienGiam;
        }
        // Chỉ setValue nếu giá trị thực sự thay đổi để tránh vòng lặp
        setValue("soTietQC", result, { shouldValidate: false, shouldDirty: false });
    }, [tyLeMienGiam, setValue, currentUser]);


    const fetchData2 = async () => {
        try {
            const res = await fetch(`/api/work-hours/select/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('DATA:', data)

                // Lọc các item có soMien === -1 hoặc maCV bắt đầu bằng 'NGHIDH'
                const listNghiDH = data.filter(
                    item => item.chucVu?.soMien === -1
                    // item => item.chucVu?.soMien === -1 || item.chucVu?.maCV?.startsWith('NGHIDH')
                );
                // Các item còn lại
                const listKhac = data.filter(
                    item => item.chucVu?.maCV?.startsWith('NGHIDH')
                );

                setDataListSelect(data);
                setDataListSelect2(listNghiDH);
                setDataListSelect3(listKhac);

            } else {
                toast.error("Failed to fetch data");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    useEffect(() => {
        if (!currentUser?._id) return;
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/work-hours/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDataList2(data);

                    setLoading(false)
                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (err) {
                toast.error("An error occurred while fetching data");
            }
        };

        //DỮ LIỆU PHỤ LỤC

        fetchData2();
        fetchData();


    }, [namHoc]);



    useEffect(() => {
        if (dataListSelect && dataListSelect.length > 0) {
            const result = handelKiemNhiem();
            setFinalResult(result);
        } else {
            // Chỉ reset nếu thực sự có dữ liệu cũ
            if (resultsDisplay.length !== 0) setResultsDisplay([]);
            if (dataTong.length !== 0) setDataTong([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataListSelect]);

    const onSubmitMienGiam = (item, soTietQC) => {
        // Lấy endTime thực tế
        const endTime = item.endTime || schoolYearEnd;
        const newRow = {
            chucVuCongViec: item.chucVu.tenCV,
            maCV: item.chucVu.maCV,
            thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(endTime).toLocaleDateString('vi-VN')}`,
            tyLeMienGiam: item.chucVu.soMien,
            soTietQC: Math.round(soTietQC * 100) / 100,
            ghiChu: item.ghiChu || '',
            namHoc: namHoc,
            user: item.user,
            startTime: item.startTime,
            endTime: endTime,
            _id: generateUniqueId(),
        };
        setDataList(prev => {
            // Loại bỏ các dòng đã trùng hoàn toàn các trường định danh (không thêm mới nếu đã có)
            const exists = prev.some(row =>
                row.chucVuCongViec === newRow.chucVuCongViec &&
                row.maCV === newRow.maCV &&
                row.thoiGianTinh === newRow.thoiGianTinh &&
                row.tyLeMienGiam === newRow.tyLeMienGiam &&
                row.soTietQC === newRow.soTietQC &&
                row.namHoc === newRow.namHoc &&
                row.user === newRow.user &&
                row.startTime === newRow.startTime &&
                row.endTime === newRow.endTime
            );
            if (exists) return prev;
            // Ngoài ra, loại bỏ các dòng đã có cùng chucVuCongViec, thoiGianTinh, tyLeMienGiam (nếu muốn chỉ giữ 1 dòng duy nhất cho mỗi tổ hợp này)
            const filtered = prev.filter(row =>
                !(row.chucVuCongViec === newRow.chucVuCongViec &&
                    row.maCV === newRow.maCV &&
                    row.thoiGianTinh === newRow.thoiGianTinh &&
                    row.tyLeMienGiam === newRow.tyLeMienGiam)
            );
            return [...filtered, newRow];
        });
    };

    const handelKiemNhiem = () => {

        if (!dataListSelect || dataListSelect.length === 0) {
            return;
        }
        // Nếu không có dữ liệu thì return luôn, tránh xử lý tiếp
        if (!dataListSelect || dataListSelect.length === 0) {
            setResultsDisplay([]);
            setDataTong([]);
            return;
        }


        // Lấy giá trị schoolYearStart và schoolYearEnd từ state (lấy từ DB)
        let dau_nam = schoolYearStart ? new Date(schoolYearStart) : null;
        let cuoi_nam = schoolYearEnd ? new Date(schoolYearEnd) : null;
        let flat = false;

        dataListSelect.forEach((item) => {
            if (item.chucVu?.soMien === -1) {
                flat = true;
            };
        })

        const events = [];
        const GCGD = Number(currentUser.maNgachInfo.GCGD);

        let GCGD2 = 0;
        let schoolYearEndDate2;
        let dateStart2;
        let dateEnd2;
        let gValue2 = 0;

        if (dataListSelect2 && dataListSelect2.length > 0) {
            // Lấy schoolYearEnd từ state thay vì dataListSelect2[0]
            schoolYearEndDate2 = schoolYearEnd ? new Date(schoolYearEnd) : null;
            dateStart2 = new Date(dataListSelect2[0].startTime);
            const itemEndDate = dataListSelect2[0].endTime ? new Date(dataListSelect2[0].endTime) : schoolYearEndDate2;
            dateEnd2 = (itemEndDate > schoolYearEndDate2) ? schoolYearEndDate2 : itemEndDate;

            // Nếu là -1: Tính bằng số tuần * GCGD / 44
            if (dataListSelect2[0].chucVu?.soMien === -1) {
                const diffTime = Math.abs(dateEnd2 - dateStart2);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const weeks = Math.round((diffDays / 7) * 10) / 10;
                gValue2 = Math.round(((weeks * GCGD) / 44) * 10) / 10;
                GCGD2 = GCGD - gValue2;
                setMienGiam2(gValue2);
                onSubmitMienGiam(dataListSelect2[0], gValue2);

            }
        }

        // TH CHỈ CÓ BẢO HIỂM
        if (dataListSelect.length === 1 && dataListSelect[0].chucVu?.soMien === -1) return Math.round(gValue2 * 100) / 100;

        // TH CHỈ CÓ ĐI HỌC
        if (dataListSelect.length === 1 && dataListSelect3.length === 1) {

            const schoolYearEndDate = schoolYearEnd ? new Date(schoolYearEnd) : null;
            const dateStart = new Date(dataListSelect3[0].startTime);
            const itemEndDate = dataListSelect3[0].endTime ? new Date(dataListSelect3[0].endTime) : schoolYearEndDate;
            const dateEnd = (itemEndDate > schoolYearEndDate) ? schoolYearEndDate : itemEndDate;

            const diffTime = Math.abs(dateEnd - dateStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const weeks = Math.round((diffDays / 7) * 10) / 10;

            const gvalue = GCGD * dataListSelect3[0].chucVu.soMien;

            const result = Math.round(((weeks * gvalue) / 44) * 10) / 10;
            setMienGiam(result);
            onSubmitMienGiam(dataListSelect3[0], result);

            console.log('result:', result)
            console.log('weeks:', weeks)
            console.log('gvalue:', gvalue)
            console.log('GCGD:', GCGD)

            return;
        }

        // TH 2: 2 công việc, 1 BẢO HIỂM , 1 ĐI HỌC VÀ TÍNH CHO ĐI HỌC
        if (dataListSelect.length === 2 && dataListSelect3.length === 1 && dataListSelect2.length === 1) {

            const schoolYearEndDate = schoolYearEnd ? new Date(schoolYearEnd) : null;
            const dateStart = new Date(dataListSelect3[0].startTime);
            const itemEndDate = dataListSelect3[0].endTime ? new Date(dataListSelect3[0].endTime) : schoolYearEndDate;
            const dateEnd = (itemEndDate > schoolYearEndDate) ? schoolYearEndDate : itemEndDate;

            const diffTime = Math.abs(dateEnd - dateStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.round((diffDays / 7) * 10) / 10;

            const gvalue = GCGD2 * dataListSelect3[0].chucVu.soMien;

            const result = Math.round(((weeks * gvalue) / 44) * 10) / 10;
            setMienGiam(result);
            onSubmitMienGiam(dataListSelect3[0], result);
            return;
        }

        // Tạo danh sách sự kiện từ dataListSelect
        dataListSelect.forEach((item) => {

            if (item.chucVu?.soMien === -1 || item.chucVu?.maCV?.startsWith('NGHIDH')) return;
            if (item.startTime && item.chucVu?.soMien !== undefined) {
                // Lấy schoolYearEnd từ state thay vì dataListSelect[0]
                const schoolYearEndDate = schoolYearEnd ? new Date(schoolYearEnd) : null;
                const dateStart = new Date(item.startTime);
                const itemEndDate = item.endTime ? new Date(item.endTime) : schoolYearEndDate;
                const dateEnd = (itemEndDate > schoolYearEndDate) ? schoolYearEndDate : itemEndDate;

                const yearMonthStart = `${dateStart?.getFullYear()}-${(dateStart?.getMonth() + 1).toString().padStart(2, '0')}`;
                const yearMonthEnd = `${dateEnd?.getFullYear()}-${(dateEnd?.getMonth() + 1).toString().padStart(2, '0')}`;

                let gValue;

                if (item.chucVu.soMien < 1) {

                    const gValueT = item.chucVu.soMien * GCGD;
                    console.log('item.chucVu.soMien:', item.chucVu.soMien)
                    console.log('GCGD:', GCGD)
                    console.log('gValueT:', gValueT)


                    const diffTime = Math.abs(dateEnd - dateStart);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    const weeks = Math.round((diffDays / 7) * 10) / 10;

                    gValue = Math.round(((weeks * gValueT) / 44) * 10) / 10;

                    console.log('gValue:', gValue)
                    console.log('weeks:', weeks)

                    console.log('diffDays[0]:', GCGD)


                    // Tạo object theo cấu trúc columns và thêm vào dataList (bổ sung đủ trường)
                    const endTime = item.endTime || schoolYearEnd;
                    const newRow = {
                        chucVuCongViec: item.chucVu.tenCV,
                        maCV: item.chucVu.maCV,
                        thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(endTime).toLocaleDateString('vi-VN')}`,
                        tyLeMienGiam: item.chucVu.soMien,
                        soTietQC: Math.round(gValue * 100) / 100,
                        ghiChu: item.ghiChu || '',
                        namHoc: namHoc,
                        user: item.user,
                        startTime: item.startTime,
                        endTime: endTime,
                        _id: generateUniqueId(),
                    };
                    setDataList(prev => {
                        const exists = prev.some(row =>
                            row.chucVuCongViec === newRow.chucVuCongViec &&
                            row.thoiGianTinh === newRow.thoiGianTinh &&
                            row.tyLeMienGiam === newRow.tyLeMienGiam &&
                            row.soTietQC === newRow.soTietQC
                        );
                        if (exists) return prev;
                        return [...prev, newRow];
                    });
                }
                else {
                    gValue = Math.round(item.chucVu.soMien * 10) / 10;

                    // Tạo object theo cấu trúc columns và thêm vào dataList (bổ sung đủ trường)
                    const endTime = item.endTime || schoolYearEnd;
                    const newRow = {
                        chucVuCongViec: item.chucVu.tenCV,
                        maCV: item.chucVu.maCV,
                        thoiGianTinh: `${new Date(item.startTime).toLocaleDateString('vi-VN')} - ${new Date(endTime).toLocaleDateString('vi-VN')}`,
                        tyLeMienGiam: item.chucVu.soMien,
                        soTietQC: Math.round(gValue * 100) / 100,
                        ghiChu: item.ghiChu || '',
                        namHoc: namHoc,
                        user: item.user,
                        startTime: item.startTime,
                        endTime: endTime,
                        _id: generateUniqueId(),
                    };
                    setDataList(prev => {
                        const exists = prev.some(row =>
                            row.chucVuCongViec === newRow.chucVuCongViec &&
                            row.thoiGianTinh === newRow.thoiGianTinh &&
                            row.tyLeMienGiam === newRow.tyLeMienGiam &&
                            row.soTietQC === newRow.soTietQC
                        );
                        if (exists) return prev;
                        return [...prev, newRow];
                    });
                }

                if (dau_nam && dateStart.getMonth() < dau_nam.getMonth() && dateStart.getFullYear() == dau_nam.getFullYear()) {
                    const yearMonthStart = `${dateStart.getFullYear()}-${(dau_nam.getMonth() + 1).toString().padStart(2, '0')}`;
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }
                else {
                    events.push({ time: yearMonthStart, type: "start", gValue });
                }

                if (cuoi_nam && dateEnd.getMonth() > cuoi_nam.getMonth() && dateEnd.getFullYear() === cuoi_nam.getFullYear()) {
                    const yearMonthEnd = `${dateStart.getFullYear()}-${(cuoi_nam.getMonth() + 1).toString().padStart(2, '0')}`;
                    events.push({ time: yearMonthEnd, type: "end", gValue });
                }
                else {
                    events.push({ time: yearMonthEnd, type: "end", gValue });
                }
            }
        });


        // Sắp xếp dựa trên giá trị thời gian
        events.sort((a, b) => {
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return dateA - dateB;
        });

        let previousTime = null;
        let currentMax = 0;
        const activeValues = [];
        const results = [];

        // Duyệt qua các sự kiện
        events.forEach((event) => {
            const { time, type, gValue } = event;

            // Lưu kết quả nếu có khoảng thời gian trước đó
            if (previousTime !== null && time > previousTime) {
                results.push({ from: previousTime, to: time, max: currentMax });
            }

            // Cập nhật thời gian trước đó
            previousTime = time;

            // Xử lý sự kiện
            if (type === "start") {
                activeValues.push(gValue);
            } else if (type === "end") {
                const index = activeValues.indexOf(gValue);
                if (index > -1) activeValues.splice(index, 1);
            }

            // Cập nhật giá trị gmax
            currentMax = activeValues.length ? Math.max(...activeValues) : 0;
        });


        // Cập nhật state với kết quả
        setResultsDisplay(results.map((r) => ({
            from: new Date(r.from).toLocaleDateString("vi-VN"),
            to: new Date(r.to).toLocaleDateString("vi-VN"),
            max: r.max,
        })));

        setDataTong(results)

        // Tính tổng max, làm tròn 2 chữ số
        let totalMax = results.reduce((sum, r) => sum + (Number(r.max) || 0), 0);
        totalMax = Math.round(totalMax * 100) / 100;

        if (dataListSelect3.length > 0) {

            const result = (GCGD - totalMax) * dataListSelect3[0].chucVu.soMien;

            const schoolYearEndDate = schoolYearEnd ? new Date(schoolYearEnd) : null;
            const dateStart = new Date(item.startTime);
            const itemEndDate = item.endTime ? new Date(item.endTime) : schoolYearEndDate;
            const dateEnd = (itemEndDate > schoolYearEndDate) ? schoolYearEndDate : itemEndDate;

            const diffTime = Math.abs(dateEnd - dateStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.round((diffDays / 7) * 10) / 10;

            console.log('weeks:', weeks)
            console.log('result:', result)

            const gValue = Math.round(((weeks * result) / 44) * 10) / 10;

            console.log('gValue:', gValue)


            setMienGiam(gValue);
            onSubmitMienGiam(dataListSelect3[0], gValue);
        }
        const resultFinal = Math.round((totalMax + mienGiam2 + mienGiam) * 100) / 100;
        return resultFinal;
    };

    useEffect(() => {
        onUpdateCongTacKiemNhiem(finalResult);
    }, [finalResult]);

    const onReset = () => {
        // Giữ lại user và startTime sau khi submit thành công
        const currentUser_id = watch('user');
        const currentStartTime = watch('startTime') || schoolYearStart;

        reset(formSchema);

        // Set lại các giá trị cần giữ
        if (currentUser_id) {
            setValue('user', currentUser_id);
        }
        if (currentStartTime) {
            setValue('startTime', currentStartTime);
        }

        setEditRecord(null);
    };

    // For PHỤ LỤC CÔNG VIỆC table
    const handleEdit = (record) => {
        setEditSource('phu-luc');
        setEditRecord({
            ...record,
            chucVu: record.chucVu?._id || record.chucVu,
            user: record.user?._id || record.user,
            startTime: record.startTime ? dayjs(record.startTime) : null,
            endTime: record.endTime ? dayjs(record.endTime) : null,
            schoolYearStart: record.schoolYearStart ? dayjs(record.schoolYearStart) : null,
            schoolYearEnd: record.schoolYearEnd ? dayjs(record.schoolYearEnd) : null,
        });
        setEditRecordDaLuu(null);
    };

    // For DANH SÁCH ĐÃ LƯU table
    const handleEditDaLuu = (record) => {
        setEditSource('da-luu');
        setEditRecordDaLuu({
            ...record,
            chucVu: record.chucVu?._id || record.chucVu,
            user: record.user?._id || record.user,
            startTime: record.startTime ? dayjs(record.startTime) : null,
            endTime: record.endTime ? dayjs(record.endTime) : null,
            schoolYearStart: record.schoolYearStart ? dayjs(record.schoolYearStart) : null,
            schoolYearEnd: record.schoolYearEnd ? dayjs(record.schoolYearEnd) : null,
        });
        setEditRecord(null);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch("/api/work-hours/kiem-nhiem", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setDataList2(prevData => prevData.filter(item => item._id !== id));
                toast.success("Xóa thành công");
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred while deleting data");
        }
    };

    const columns = [
        {
            title: 'Chức vụ, công việc',
            dataIndex: 'chucVuCongViec',
            key: 'chucVuCongViec',
            className: 'text-blue-600 font-medium',
            width: '24%',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            sorter: (a, b) => a.chucVuCongViec.localeCompare(b.chucVuCongViec),
        },
        {
            title: 'Thời gian tính',
            dataIndex: 'thoiGianTinh',
            key: 'thoiGianTinh',
            width: '18%',
            render: (text) => <span className="text-gray-700">{text}</span>,
            sorter: (a, b) => a.thoiGianTinh.localeCompare(b.thoiGianTinh)
        },
        {
            title: 'Tỷ lệ % miễn giảm',
            dataIndex: 'tyLeMienGiam',
            key: 'tyLeMienGiam',
            align: 'center',
            width: '12%',
            render: (text) => <span>{text}</span>,
            sorter: (a, b) => a.tyLeMienGiam - b.tyLeMienGiam
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQC',
            key: 'soTietQC',
            className: 'text-red-600 font-medium',
            align: 'center',
            width: '12%',
            render: (text) => <span className="text-red-600 font-medium">{text}</span>,
            sorter: (a, b) => a.soTietQC - b.soTietQC
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '15%',
            ellipsis: true
        },
    ];
    const columns2 = [
        {
            title: 'Chức vụ, công việc',
            dataIndex: 'chucVuCongViec',
            key: 'chucVuCongViec',
            className: 'text-blue-600 font-medium',
            width: '24%',
            render: (text) => <span className="text-blue-600 font-medium">{text}</span>,
            sorter: (a, b) => a.chucVuCongViec.localeCompare(b.chucVuCongViec),
        },
        {
            title: 'Thời gian tính',
            dataIndex: 'thoiGianTinh',
            key: 'thoiGianTinh',
            width: '18%',
            render: (text) => <span className="text-gray-700">{text}</span>,
            sorter: (a, b) => a.thoiGianTinh.localeCompare(b.thoiGianTinh)
        },
        {
            title: 'Tỷ lệ % miễn giảm',
            dataIndex: 'tyLeMienGiam',
            key: 'tyLeMienGiam',
            align: 'center',
            width: '12%',
            render: (text) => <span>{text}</span>,
            sorter: (a, b) => a.tyLeMienGiam - b.tyLeMienGiam
        },
        {
            title: 'Số tiết quy chuẩn',
            dataIndex: 'soTietQC',
            key: 'soTietQC',
            className: 'text-red-600 font-medium',
            align: 'center',
            width: '12%',
            render: (text) => <span className="text-red-600 font-medium">{text}</span>,
            sorter: (a, b) => a.soTietQC - b.soTietQC
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            width: '15%',
            ellipsis: true
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleEditDaLuu(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        getPopupContainer={trigger => trigger.parentNode}
                    >
                        <Button danger size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];



    const handleTableChange = (pagination) => {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize); // Thêm dòng này
    };

    const handleTabChange = (key) => {
        setLoadings(true);
        setSelectedTab(key);
        setEditSource(null); // <-- Thêm dòng này
        setTimeout(() => {
            setLoadings(false);
        }, 500);
    };


    const handleSelectChange = (value) => {
        setValue("tyLeMienGiam", value?.tyLeMienGiam);
        setValue("ghiChu", value?.ghiChu);
        setValue("chucVuCongViec", value?.chucVuCongViec);
        setValue("thoiGianTinh", value?.thoiGianTinh);
        setValue("soTietQC", value?.soTietQC);
    };


    // Lấy schoolYearStart, schoolYearEnd từ Setting (chỉ hiển thị, không cho chọn)


    const fetchData5 = async () => {
        try {
            const res = await fetch(`/api/admin/user/user-select`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListUser(data);
                setLoading(false)
            } else {
                toast.error("Failed to fetch data user");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    const fetchData6 = async () => {
        try {
            const res = await fetch(`/api/admin/select/kiem-nhiem`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setListChucVu(data);
            } else {
                toast.error("Failed to fetch data chucVu");
            }
        } catch (err) {
            toast.error("An error occurred while fetching data");
        }
    };

    useEffect(() => {
        fetchData5();
        fetchData6();

        // Đã chuyển sang lấy từ Setting, không dùng localStorage nữa
    }, []);

    // Không cho phép thay đổi schoolYearStart, schoolYearEnd nữa
    // const handleSchoolYearEndChange = (date) => {...}
    // const handleSchoolYearStartChange = (date) => {...}

    const onSubmit = async (data) => {
        try {
            // Sử dụng schoolYearStart làm default nếu không có startTime
            const startTime = data.startTime || schoolYearStart;

            if (!startTime) {
                toast.error('Không thể xác định ngày bắt đầu!');
                return;
            }

          
            // Thêm ngày bắt đầu/kết thúc năm học vào data
            const payload = {
                ...data,
                startTime,
                id: editRecord?._id,
                schoolYearStart,
                schoolYearEnd,
            };
            console.log(payload);
            const method = editRecord ? "PUT" : "POST";
            const res = await fetch("/api/users/kiem-nhiem-user", {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success(editRecord ? "Chỉnh sửa thành công" : "Thêm mới thành công");
                fetchData2();
                onReset();
            } else {
                toast.error("Failed to save record");
            }
        } catch (err) {
            toast.error("An error occurred while saving data");
        }
    };

    const onReset2 = () => {
        // Giữ lại user và startTime khi reset
        const currentUser_id = watch('user');
        const currentStartTime = watch('startTime') || schoolYearStart;

        reset(formSchema);

        // Set lại các giá trị cần giữ
        if (currentUser_id) {
            setValue('user', currentUser_id);
        }
        if (currentStartTime) {
            setValue('startTime', currentStartTime);
        }

        setEditRecord(null);
        setEditSource(null);
    };

    const onResetDaLuu = () => {
        setFormDaLuu(formSchema);
        setEditRecordDaLuu(null);
        setEditSource(null);
    };

    // Submit for DANH SÁCH ĐÃ LƯU edit form
    const onSubmitDaLuu = async (e) => {
        e.preventDefault();

        // Validate các trường bắt buộc
        if (!formDaLuu.chucVuCongViec || !formDaLuu.user || !formDaLuu.thoiGianTinh) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
            return;
        }

        // Chỉ lấy đúng các trường cần thiết, ĐÚNG TÊN _id
        const payload = {
            chucVuCongViec: formDaLuu.chucVuCongViec,
            user: formDaLuu.user,
            thoiGianTinh: formDaLuu.thoiGianTinh,
            ghiChu: formDaLuu.ghiChu,
            _id: formDaLuu._id || formDaLuu.id, // ĐÚNG TÊN
        };

        try {
            const res = await fetch("/api/work-hours/kiem-nhiem", {
                method: "PATCH",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                toast.success("Chỉnh sửa thành công");
                const updated = await res.json(); // server trả về bản ghi đã update
                setDataList2(prev =>
                    prev.map(item =>
                        (item._id === updated._id) ? updated : item
                    )
                );
                onResetDaLuu(); // reset form
            } else {
                toast.error("Lưu thất bại!");
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi lưu!");
        }
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="flex gap-2 max-sm:flex-col h-full">
            {/* Form bên trái */}
            <div className="p-3 px-5 shadow-lg bg-white rounded-xl border border-gray-100 flex-shrink-0 " style={{ width: '30%', maxHeight: 'calc(85vh - 90px)' }}>
                {/* Only show PHỤ LỤC CÔNG VIỆC form if not editing DANH SÁCH ĐÃ LƯU */}
                {(!editSource || editSource === 'phu-luc') && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <Title className="text-center m-0" level={4}>PHÂN CÔNG KIỆM NHIỆM</Title>
                        </div>
                        <Divider className="my-1" />
                        <div className="flex gap-4 text-small-bold">
                            <div className="w-1/2">
                                <div className="font-bold mb-1">Ngày bắt đầu năm học <span className="text-red-600">*</span></div>
                                <DatePicker
                                    value={schoolYearStart}
                                    disabled
                                    placeholder="yy-mm-dd"
                                    style={{ width: '100%' }}
                                    className={!schoolYearStart ? 'border-red-300 hover:border-red-500' : ''}
                                />
                                {!schoolYearStart && <div className="text-red-500 text-sm mt-1">Trường này là bắt buộc</div>}
                            </div>
                            <div className="w-1/2">
                                <div className="font-bold mb-1">Ngày kết thúc năm học <span className="text-red-600">*</span></div>
                                <DatePicker
                                    value={schoolYearEnd}
                                    disabled
                                    placeholder="yy-mm-dd"
                                    style={{ width: '100%' }}
                                    className={!schoolYearEnd ? 'border-red-300 hover:border-red-500' : ''}
                                />
                                {!schoolYearEnd && <div className="text-red-500 text-sm mt-1">Trường này là bắt buộc</div>}
                            </div>
                        </div>
                        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="space-y-2 mt-3">
                            <Form.Item
                                label={<span className="font-bold text-xl">Công việc / Chức vụ <span className="text-red-600">*</span></span>}
                                validateStatus={errors.chucVu ? 'error' : ''}
                                help={errors.chucVu?.message}
                            >
                                <Controller
                                    name="chucVu"
                                    control={control}
                                    rules={{ required: "Chức vụ, công việc là bắt buộc" }}
                                    render={({ field }) => (
                                        <Select
                                            className="input-select"
                                            placeholder="Chọn công việc, chức vụ ..."
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().includes(input.toLowerCase())
                                            }
                                            {...field}
                                            options={listChucVu.map(item => ({ label: item.tenCV, value: item._id }))}
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-bold text-xl">Người nhận nhiệm vụ <span className="text-red-600">*</span></span>}
                                validateStatus={errors.user ? 'error' : ''}
                                help={errors.user?.message}
                            >
                                <Controller
                                    name="user"
                                    control={control}
                                    rules={{ required: "Bắt buộc" }}
                                    render={({ field }) => (
                                        <Select
                                            className="input-select"
                                            placeholder="Chọn người nhận nhiệm vụ ..."
                                            {...field}
                                            options={listUser.map(item => ({ label: item.username, value: item._id }))}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    )}
                                />
                            </Form.Item>

                            <div className="flex justify-between">
                                <Form.Item
                                    label={<span className="font-bold text-xl">Ngày bắt đầu</span>}
                                    className="w-[40%]"
                                    validateStatus={errors.startTime ? 'error' : ''}
                                    help={errors.startTime?.message}
                                >
                                    <Controller
                                        name="startTime"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker {...field} placeholder="Mặc định: Ngày bắt đầu năm học" />
                                        )}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="font-bold text-xl">Ngày kết thúc </span>}
                                    className="w-[40%]"
                                    help={errors.endTime?.message}
                                >
                                    <Controller
                                        name="endTime"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker {...field} placeholder="Chọn ngày kết thúc" />
                                        )}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item
                                label={<span className="font-bold text-xl">Ghi chú <span className="text-red-600">*</span></span>}
                                validateStatus={errors.ghiChu ? 'error' : ''}
                                help={errors.ghiChu?.message}
                            >
                                <Controller
                                    name="ghiChu"
                                    control={control}
                                    render={({ field }) => <TextArea className="input-text" placeholder="Nhập ghi chú..." {...field} />}
                                />
                            </Form.Item>

                            <div className="flex justify-center items-center mt-4">
                                <Space size="middle">
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-700"
                                        loading={isSubmitting}
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                    >
                                        {editRecord ? "Lưu chỉnh sửa" : "Thêm mới"}
                                    </Button>
                                    <Button onClick={onReset2}>Hủy</Button>
                                </Space>
                            </div>
                        </Form>
                    </>
                )}
                {/* Form for DANH SÁCH ĐÃ LƯU edit */}
                {editSource === 'da-luu' && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <Title className="text-center m-0" level={4}>SỬA DỮ LIỆU ĐÃ LƯU</Title>
                        </div>
                        <Divider className="my-1" />
                        <form onSubmit={onSubmitDaLuu} className="space-y-2 mt-3">
                            <div className="font-bold mb-1">Công việc / Chức vụ <span className="text-red-600">*</span></div>
                            {/* <Select
                                className="input-select"
                                placeholder="Chọn công việc, chức vụ ..."
                                value={formDaLuu.chucVu}
                                onChange={v => setFormDaLuu(f => ({ ...f, chucVu: v }))}
                                options={listChucVu.map(item => ({ label: item.tenCV, value: item._id }))}
                            /> */}
                            <input
                                className="input-text w-full border px-2 py-1 rounded"
                                type="text"
                                value={formDaLuu.chucVuCongViec || ''}
                                onChange={e => setFormDaLuu(f => ({ ...f, chucVuCongViec: e.target.value }))}
                                placeholder="Nhập chức vụ / công việc"
                                required
                            />
                            <div className="font-bold mb-1">Người nhận nhiệm vụ <span className="text-red-600">*</span></div>
                            <Select
                                className="input-select"
                                placeholder="Chọn người nhận nhiệm vụ ..."
                                value={formDaLuu.user}
                                onChange={v => setFormDaLuu(f => ({ ...f, user: v }))}
                                options={listUser.map(item => ({ label: item.username, value: item._id }))}
                                showSearch
                                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                            <div className="font-bold mb-1">Thời gian tính <span className="text-red-600">*</span></div>
                            <input
                                className="input-text w-full border px-2 py-1 rounded"
                                type="text"
                                value={formDaLuu.thoiGianTinh || ''}
                                onChange={e => setFormDaLuu(f => ({ ...f, thoiGianTinh: e.target.value }))}
                                placeholder="Nhập thời gian tính (VD: 01/09/2024 - 31/05/2025)"
                                required
                            />
                            <div className="font-bold mb-1">Ghi chú</div>
                            <TextArea
                                className="input-text"
                                placeholder="Nhập ghi chú..."
                                value={formDaLuu.ghiChu}
                                onChange={e => setFormDaLuu(f => ({ ...f, ghiChu: e.target.value }))}
                            />
                            <div className="flex justify-center items-center mt-4">
                                <Space size="middle">
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-700"
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                    >
                                        Lưu chỉnh sửa
                                    </Button>
                                    <Button onClick={onResetDaLuu}>Hủy</Button>
                                </Space>
                            </div>
                        </form>
                    </>
                )}
            </div>

            {/* Table + Kết quả bên phải */}
            <div className="flex flex-col px-3 py-2 shadow-lg bg-white rounded-xl border border-gray-100 min-w-0" style={{ width: '70%' }}>
                <div className="border-b border-blue-500 pb-0 mb-0">
                    <Title className="text-center text-blue-600" level={3}>QUẢN LÝ CÔNG TÁC KIÊM NHIỆM</Title>
                </div>
                <Tabs
                    activeKey={selectedTab}
                    onChange={handleTabChange}
                    type="card"
                    className="custom-tabs"
                >
                    <TabPane
                        tab={<span className="px-2 py-0 font-medium">DANH SÁCH CÔNG VIỆC</span>}
                        key="Danh sách công việc"
                        className="text-center px-2 py-0"
                    >
                        <div className="flex justify-end mb-1">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={async () => {
                                    if (!dataList.length) {
                                        toast.error('Không có dữ liệu để lưu!');
                                        return;
                                    }
                                    try {
                                        const res = await fetch(`/api/work-hours/kiem-nhiem?user=${encodeURIComponent(currentUser?._id)}&type=${encodeURIComponent(type)}&namHoc=${encodeURIComponent(namHoc)}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                list: dataList.map(({ _id, ...item }) => ({ ...item, type }))
                                            })
                                        });
                                        if (res.ok) {
                                            toast.success('Lưu danh sách thành công!');
                                            // Fetch lại listData2 sau khi lưu thành công
                                            const fetchData = async () => {
                                                try {
                                                    setLoading(true);
                                                    const res = await fetch(`/api/work-hours/kiem-nhiem/?user=${encodeURIComponent(currentUser._id)}&type=${encodeURIComponent(type)}&namHoc=${namHoc}`, {
                                                        method: "GET",
                                                        headers: { "Content-Type": "application/json" },
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        setDataList2(data);
                                                        setLoading(false);
                                                    } else {
                                                        toast.error("Failed to fetch data");
                                                    }
                                                } catch (err) {
                                                    toast.error("An error occurred while fetching data");
                                                }
                                            };
                                            fetchData();
                                        } else {
                                            const msg = await res.text();
                                            toast.error('Lưu thất bại: ' + msg);
                                        }
                                    } catch (err) {
                                        toast.error('Lỗi khi lưu: ' + err.message);
                                    }
                                }}
                            >
                                Lưu danh sách
                            </Button>
                        </div>
                        {loading ? <Spin size="large" /> :
                            <Table
                                columns={columns}
                                dataSource={dataList}
                                rowKey="_id"
                                pagination={{
                                    current,
                                    pageSize,
                                    total: dataList.length,
                                    onChange: (page, size) => {
                                        setCurrent(page);
                                        setPageSize(size);
                                    },
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                                }}
                                onChange={handleTableChange}
                                className="custom-table"
                                bordered
                                size="middle"
                                scroll={{ x: 'max-content', y: 'calc(85vh - 400px)' }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={3} className="font-bold text-lg text-right">
                                            Tổng số tiết quy chuẩn:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell className="font-bold text-lg text-red-600">
                                            {isEditingTotal ? (
                                                <input
                                                    type="number"
                                                    value={editableTotal ?? finalResult ?? 0}
                                                    onChange={e => setEditableTotal(Number(e.target.value))}
                                                    onBlur={() => setIsEditingTotal(false)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') setIsEditingTotal(false);
                                                    }}
                                                    style={{ width: 80, textAlign: 'right' }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setEditableTotal(finalResult ?? 0);
                                                        setIsEditingTotal(true);
                                                    }}
                                                    title="Nhấn để sửa"
                                                >
                                                    {editableTotal ?? finalResult ?? 0}
                                                </span>
                                            )}
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        }
                    </TabPane>
                    <TabPane
                        tab={<span className="px-2 py-1 font-medium">PHỤ LỤC CÔNG VIỆC</span>}
                        key="Phụ lục công việc"
                        className="text-center p-2"
                    >
                        {loadings ? <Spin size="large" /> : (
                            <>
                                <TableKiemNhiem data={dataListSelect} handleEdit={handleEdit} />
                                {/* Kết quả dưới Table */}
                                {/* <div className="mt-4 bg-white rounded-lg p-2 shadow border border-gray-100 w-full max-w-md mx-auto">
                              <div className="border-b border-blue-500 pb-2 mb-2">
                                <h3 className="text-base font-semibold text-blue-600 text-center">Kết quả</h3>
                              </div>
                              <div className="overflow-auto max-h-48">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-50 text-small-bold">
                                      <th className="border border-gray-200 px-2 py-1 text-left">Từ</th>
                                      <th className="border border-gray-200 px-2 py-1 text-left">Đến</th>
                                      <th className="border border-gray-200 px-3 py-1 text-center">Miễn giảm</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resultsDisplay.length > 0 ? (
                                      resultsDisplay.map((result, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                          <td className="border border-gray-200 px-2 py-1 text-green-600 font-medium">{result.from}</td>
                                          <td className="border border-gray-200 px-2 py-1 text-blue-600 font-medium">{result.to}</td>
                                          <td className="border border-gray-200 px-3 py-1 text-center text-red-600 font-medium">{result.max}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="text-center text-gray-400 py-2">Không có dữ liệu miễn giảm</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div> */}
                            </>
                        )}
                    </TabPane>
                    {/* Đã xoá TabPane DANH SÁCH ĐÃ LƯU bị lặp */}
                    <Tabs.TabPane
                        tab={<span className="px-2 py-1 font-medium">DANH SÁCH ĐÃ LƯU</span>}
                        key="Danh sách đã lưu"
                        className="text-center p-2"
                    >
                        {loading ? <Spin size="large" /> :
                            <Table
                                columns={columns2}
                                dataSource={dataList2}
                                rowKey="_id"
                                pagination={{
                                    current,
                                    pageSize,
                                    total: dataList2.length,
                                    onChange: (page, size) => {
                                        setCurrent(page);
                                        setPageSize(size);
                                    },
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                                }}
                                className="custom-table"
                                bordered
                                size="middle"
                                scroll={{ x: 'max-content', y: 'calc(85vh - 380px)' }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={3} className="font-bold text-lg text-right">
                                            Tổng số tiết quy chuẩn:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell className="font-bold text-lg text-red-600">
                                            {isEditingTotal ? (
                                                <input
                                                    type="number"
                                                    value={editableTotal ?? finalResult ?? 0}
                                                    onChange={e => setEditableTotal(Number(e.target.value))}
                                                    onBlur={() => {
                                                        setIsEditingTotal(false);
                                                        if (editableTotal !== null) setFinalResult(editableTotal);
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            setIsEditingTotal(false);
                                                            if (editableTotal !== null) setFinalResult(editableTotal);
                                                        }
                                                    }}
                                                    style={{ width: 80, textAlign: 'right' }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setEditableTotal(finalResult ?? 0);
                                                        setIsEditingTotal(true);
                                                    }}
                                                    title="Nhấn để sửa"
                                                >
                                                    {editableTotal ?? finalResult ?? 0}
                                                </span>
                                            )}
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        }
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default DutyExemptionForm;

