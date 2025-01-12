import mongoose from "mongoose";

const HuongDanSchema = new mongoose.Schema({
 
  tenCV: {
    type: String,
  },
  moTa: {
    type: String,
  },
  soGio: {
    type: Number,
  },
 
});

const HuongDan = mongoose.models.HuongDan || mongoose.model("HuongDan", HuongDanSchema);

export default HuongDan;
