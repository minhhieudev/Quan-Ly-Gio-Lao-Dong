import mongoose from "mongoose";

const PcChamThiSchema = new mongoose.Schema({
  hocPhan: {
    type: String,  
  },
  nhomLop: {
    type: String,  
  },
  ngayThi: {
    type: String,  
  },
  cb1: {
    type: String,  
  },
  cb2: {
    type: String,  
  },
  soBai: {
    type: Number,  
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

  hinhThuc:{
    type: String
  },
  thoiGian:{
    type: String
  }
}, {
  timestamps: true,
});

const PcChamThi = mongoose.models.PcChamThi || mongoose.model('PcChamThi', PcChamThiSchema);

export default PcChamThi;
