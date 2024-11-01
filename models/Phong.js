import mongoose from "mongoose";

const PhongSchema = new mongoose.Schema({
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
});

const Phong = mongoose.models.Phong || mongoose.model("Phong", PhongSchema);

export default Phong;
