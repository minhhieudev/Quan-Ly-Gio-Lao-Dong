import mongoose from "mongoose";

const ChucVuSchema = new mongoose.Schema({
  maCV: {
    type: String,
  },
  tenCV: {
    type: String,
  },
  loaiCV: {
    type: String,
  },
  soMien: {
    type: Number,
  },
 
});

const ChucVu = mongoose.models.ChucVu || mongoose.model("ChucVu", ChucVuSchema);

export default ChucVu;
