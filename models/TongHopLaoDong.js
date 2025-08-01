import mongoose from "mongoose";

// Main schema for Tổng hợp lao động
const TongHopLaoDongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  congTacGiangDay: {
    soTietLT: {
      type: Number,
    },
    soTietTH: {
      type: Number,
    },
    soTietQCLT: {
      type: Number,
    },
    soTietQCTH: {
      type: Number,
    },
    tong: {
      type: Number,
    },
  },
  congTacKhac: {
    chamThi: {
      type: Number,
    },
    ngoaiKhoa: {
      type: Number,
    },
    coiThi: {
      type: Number,
    },
    deThi: {
      type: Number,
    },
    tong: {
      type: Number,
    },
  },
  kiemNhiem: {
    type: Number,
  },
  chuanNamHoc: {
    type: Number,
  },
  tongGioChinhQuy: {
    type: Number,
  },
  thuaThieuGioLaoDong: {
    type: Number,
  },
  ghiChu: {
    type: String,
  },
  loai: {
    type: String,
  },
  namHoc: {
    type: String,
  },
  trangThai: {           // Thêm trường này
    type: Number,
    default: 10,
  },
},{
  timestamps: true,
});

const TongHopLaoDong = mongoose.models.TongHopLaoDong || mongoose.model('TongHopLaoDong', TongHopLaoDongSchema);

export default TongHopLaoDong;

