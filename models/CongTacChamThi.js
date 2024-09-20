import mongoose from "mongoose";

const CongTacChamThiSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hocPhan: {
    type: String,
    required: true,
  },
  lopHocPhan: {
    type: String,
    required: true,
  },
  ky: {
    type: String,
    required: true,
  },
  canBoChamThi: {
    type: String,
    required: true,
  },
  soBaiCham: {
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
  hinhThucThoiGianThi: {
    type: String,  
  },
},{
  timestamps: true,
});

const CongTacChamThi = mongoose.models.CongTacChamThi || mongoose.model("CongTacChamThi", CongTacChamThiSchema);

export default CongTacChamThi;
