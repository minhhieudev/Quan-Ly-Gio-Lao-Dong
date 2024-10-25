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
});

const MaNgach = mongoose.models.MaNgach || mongoose.model("MaNgach", MaNgachSchema);

export default MaNgach;
