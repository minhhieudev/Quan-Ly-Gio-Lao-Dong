import mongoose from "mongoose";

const PhanCongKiemNhiemSchema = new mongoose.Schema({
 
  chucVu: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ChucVu", 
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  ghiChu: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
  },

});

const PhanCongKiemNhiem = mongoose.models.PhanCongKiemNhiem || mongoose.model("PhanCongKiemNhiem", PhanCongKiemNhiemSchema);

export default PhanCongKiemNhiem;
