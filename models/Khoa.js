import mongoose from "mongoose";

const KhoaSchema = new mongoose.Schema({
  maKhoa: {
    type: String,
  },
  tenKhoa: {
    type: String,
    unique: true,
  },
});

const Khoa = mongoose.models.Khoa || mongoose.model("Khoa", KhoaSchema);

export default Khoa;
