import mongoose from "mongoose";

const PcCoiThiSchema = new mongoose.Schema({
  hocPhan: {
    type: [String],  
  },
  nhomLop: {
    type: [String],  
  },
  ngayThi: {
    type: String,  
  },
  ca: {
    type: Number, 
  },
  cb1: {
    type: String,  
  },
  cb2: {
    type: String,  
  },
  time: {
    type: [Number],  
  },
  phongThi: {
    type: String,  
  },
  diaDiem: {
    type: String,  
  },
  ghiChu: {
    type: String,  
  },
  namHoc: {
    type: String,  
  },
  loaiKyThi: {
    type: String,  
  },
  loai: {
    type: String,  
  },
  ky: {
    type: String,
  },
}, {
  timestamps: true,
});

const PcCoiThi = mongoose.models.PcCoiThi || mongoose.model('PcCoiThi', PcCoiThiSchema);

export default PcCoiThi;
