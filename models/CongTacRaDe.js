import mongoose from "mongoose";

const CongTacRaDeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hocPhan: {
    type: String,
    required: true,
  },
  soTC: {
    type: Number,
    required: true,
  },
  lopHocPhan: {
    type: String,
    required: true,
  },
  ky: {
    type: String,
  },
  hinhThucThi: {
    type: String,
    required: true,
  },
  thoiGianThi: {
    type: Number,
    required: true,
  },
  soTietQuyChuan: {
    type: Number,
    required: true,
  },
  ghiChu: {
    type: String,
  },
  namHoc: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
},{
  timestamps: true,
});

const CongTacRaDe = mongoose.models.CongTacRaDe || mongoose.model('CongTacRaDe', CongTacRaDeSchema);

export default CongTacRaDe;
