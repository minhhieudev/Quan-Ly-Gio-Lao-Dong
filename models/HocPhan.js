import mongoose from "mongoose";

const HocPhanSchema = new mongoose.Schema({
  maMH: {
    type: String,
  },
  tenMH: {
    type: String,
  },
  soTC: {
    type: Number,
  },
  soTietLT: {
    type: Number,
  },
  soTietTH: {
    type: String,
  },
  trinhDo: {
    type: String,
  },
  heSo: {
    type: String,
  },
  soLuong: {
    type: String,
  },
  ghiChu: {
    type: String,
  },
},{
  timestamps: true,
});

const HocPhan = mongoose.models.HocPhan || mongoose.model("HocPhan", HocPhanSchema);

export default HocPhan;
