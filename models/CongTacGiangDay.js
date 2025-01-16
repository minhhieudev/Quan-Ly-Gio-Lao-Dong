import mongoose from "mongoose";

const CongTacGiangDaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  hocPhan: {
    type: String,
  },
  maMH: {
    type: String,
  },
  ky: {
    type: String,
  },
  lopHocPhan: {
    type: String,
  },
  soTinChi: {
    type: Number,
  },
  soSV: {
    type: Number,
  },
  soTietLT: {
    type: Number,
  },
  soTietTH: {
    type: String,
  },
  soTietQCLT: {
    type: Number,
  },
  soTietQCTH: {
    type: Number,
  },
  ghiChu: {
    type: String,
  },
  tongCong: {
    type: Number,
  },
  namHoc: {
    type: String,
  },
  type: {
    type: String,
  },


  hinhThucTH: {
    type: String,
  },
  boMon: {
    type: String,
  },
  nganh: {
    type: String,
  },
  khoa: {
    type: String,
  },

}, {
  timestamps: true,
});

const CongTacGiangDay = mongoose.models.CongTacGiangDay || mongoose.model('CongTacGiangDay', CongTacGiangDaySchema);

export default CongTacGiangDay;
