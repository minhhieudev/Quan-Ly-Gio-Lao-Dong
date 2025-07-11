import mongoose from "mongoose";

const CongTacKiemNhiemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chucVuCongViec: {
    type: String,
    required: true,
  },
  thoiGianTinh: {
    type: String,
    required: true,
  },
  tyLeMienGiam: {
    type: Number,
    required: true,
  },
  soTietQC: {
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
  ky: {
    type: String,
  },
},{
  timestamps: true,
});

CongTacKiemNhiemSchema.index(
  { user: 1, chucVuCongViec: 1, thoiGianTinh: 1, namHoc: 1, type: 1 },
  { unique: true }
);

const CongTacKiemNhiem = mongoose.models.CongTacKiemNhiem || mongoose.model('CongTacKiemNhiem', CongTacKiemNhiemSchema);

export default CongTacKiemNhiem;
