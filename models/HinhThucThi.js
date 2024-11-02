import mongoose from "mongoose";

const HinhThucThiSchema = new mongoose.Schema({
  ten: {
    type: String,
  },
  soLuong: {
    type: Number,
  },
  soGio: {
    type: Number,
  },
 
});

const HinhThucThi = mongoose.models.HinhThucThi || mongoose.model("HinhThucThi", HinhThucThiSchema);

export default HinhThucThi;
