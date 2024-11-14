import mongoose from "mongoose";

const MaNgachSchema = new mongoose.Schema({
  maNgach: {
    type: String,
  },
  tenNgach: {
    type: String,
  },
  GCGD: {
    type: Number,
  },
  GCNCKH: {
    type: Number,
  },
  GCPVCD: {
    type: Number,
  },

  GCGDNam: {
    type: Number,
  },
  GCNCKHNam: {
    type: Number,
  },
  GCPVCDNam: {
    type: Number,
  },
});

const MaNgach = mongoose.models.MaNgach || mongoose.model("MaNgach", MaNgachSchema);

export default MaNgach;
