import mongoose from "mongoose";

const LopSchema = new mongoose.Schema({
  tenLop: {
    type: String,
  },
  Khoa: {
    type: String,
  },
  soSV: {
    type: Number,
  },
});

const Lop = mongoose.models.Lop || mongoose.model("Lop", LopSchema);

export default Lop;
