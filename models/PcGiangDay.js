import mongoose from "mongoose";
const PcGiangDaySchema = new mongoose.Schema({
  maMH: {
    type: String,
  },
  tenMH: {
    type: String,
  },
  soTC: {
    type: Number,
  },
  soSVDK: {
    type: Number,
  },
  gvGiangDay: {
    type: String,
  },
  maGV: {
    type: String,
  },
  nhom: {
    type: Number,
  },
  thu: {
    type: String,
  },
  tietBD: {
    type: Number,
  },
  soTiet: {
    type: Number,
  },
  phong: {
    type: String,
  },
  lop: {
    type: String,
  },
  tuanHoc: {
    type: String,
  },
  namHoc: {
    type: String,
  },
  ky: {
    type: Number,
  },
  loai: {
    type: String,
    default: 'Chính quy'
  },
  diaDiem: {
    type: String,
    default: 'DHPY'
  },
  
}, {
  timestamps: true,
});

const PcGiangDay = mongoose.models.PcGiangDay || mongoose.model('PcGiangDay', PcGiangDaySchema);

export default PcGiangDay;
