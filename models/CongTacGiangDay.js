import mongoose from "mongoose";

const CongTacGiangDaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hocPhan: {
    type: String,
    required: true,
  },
  ky: {
    type: String,
    required: true,
  },
  lopHocPhan: {
    type: String,
    required: true,
  },
  soTinChi: {
    type: Number,
    required: true,
  },
  soSV: {
    type: Number,
    required: true,
  },
  soTietLT: {
    type: Number,
    required: true,
  },
  soTietTH: {
    type: Number,
    required: true,
  },
  soTietQCLT: {
    type: Number,
    required: true,
  },
  soTietQCTH: {
    type: Number,
    required: true,
  },
  ghiChu: {
    type: String,
  },
  tongCong: {
    type: Number,
    required: true,
  },
  namHoc: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const CongTacGiangDay = mongoose.models.CongTacGiangDay || mongoose.model('CongTacGiangDay', CongTacGiangDaySchema);

export default CongTacGiangDay;
