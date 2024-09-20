import mongoose from "mongoose";

const CongTacHuongDanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  noiDungCongViec: {
    type: String,
    required: true,
  },
  soSVSoNhom: {
    type: String,
    required: true,
  },
  lopHocPhan: {
    type: String,
    required: true,
  },
  thoiGian: {
    type: String,
    required: true,
  },
  soBuoi: {
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

const CongTacHuongDan = mongoose.models.CongTacHuongDan || mongoose.model('CongTacHuongDan', CongTacHuongDanSchema);

export default CongTacHuongDan;
