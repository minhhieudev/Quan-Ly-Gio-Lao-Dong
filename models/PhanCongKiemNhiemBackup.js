import mongoose from "mongoose";

const PhanCongKiemNhiemBackupSchema = new mongoose.Schema({
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
  schoolYearStart: {
    type: Date,
  },
  schoolYearEnd: {
    type: Date,
  },
  transferredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const PhanCongKiemNhiemBackup = mongoose.models.PhanCongKiemNhiemBackup || mongoose.model("PhanCongKiemNhiemBackup", PhanCongKiemNhiemBackupSchema);

export default PhanCongKiemNhiemBackup;
