import mongoose from "mongoose";

const BoiDuongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  chuyenDe: {
    type: String,
  },
  loaiHinh: {
    type: String,
  },
  lopGiangDay: {
    type: String,
  },
  soHV: {
    type: Number,
  },
  thoiGian: {
    type: String,
  },
  soTietLT: {
    type: Number,
  },
  soTietTH: {
    type: Number,
  },
  soTietQuyChuan: {
    type: Number,
  },
  ghiChu: {
    type: String,
  },
  namHoc: {
    type: String,
  },
},{
  timestamps: true,
});

const BoiDuong = mongoose.models.BoiDuong || mongoose.model("BoiDuong", BoiDuongSchema);

export default BoiDuong;
