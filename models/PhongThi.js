import mongoose from "mongoose";

const PhongThiSchema = new mongoose.Schema({
  tenPhong: {
    type: String,
    unique: true,
  },
  soCho: {
    type: Number,
  },
  loai: {
    type: String,
  },
  viTri: {
    type: String,
  },
  dotThi: {
    type: String,
  },
  hocKy: {
    type: String,
  },
  namHoc: {
    type: String,
  },
  ngayThi: {
    type: String,
  },
  ca: {
    type: String,
  },
  trangThai: {
    type: Boolean,
  },
});

const PhongThi = mongoose.models.PhongThi || mongoose.model("PhongThi", PhongThiSchema);

export default PhongThi;
