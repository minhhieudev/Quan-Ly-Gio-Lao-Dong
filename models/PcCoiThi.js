import { Schema, model, models } from "mongoose";

const PcCoiThiSchema = new Schema({
  maHocPhan: {
    type: String,
    default: ""
  },
  hocPhan: {
    type: [String], // Array of strings để hỗ trợ nhiều học phần
    required: true
  },
  lop: {
    type: [String], // Array of strings để hỗ trợ nhiều lớp/nhóm
    default: []
  },
  ngayThi: {
    type: String, // Dùng String thay vì Date để dễ xử lý
    required: true
  },
  ca: {
    type: String, // "1" = Sáng, "2" = Chiều
    default: "1"
  },
  phong: {
    type: [String], // Array of strings để hỗ trợ nhiều phòng
    default: []
  },
  cbo1: {
    type: [String], // Array of strings để hỗ trợ nhiều cán bộ 1
    default: []
  },
  cbo2: {
    type: [String], // Array of strings để hỗ trợ nhiều cán bộ 2
    default: []
  },
  hinhThuc: {
    type: [String], // Array of strings để hỗ trợ nhiều hình thức
    default: []
  },
  thoiGian: {
    type: [String], // Array of strings để hỗ trợ nhiều thời gian
    default: []
  },
  namHoc: {
    type: String,
    required: true
  },
  ky: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index để tối ưu query
PcCoiThiSchema.index({ namHoc: 1, ky: 1, type: 1, user: 1 });
PcCoiThiSchema.index({ hocPhan: 1, ngayThi: 1, user: 1 });

const PcCoiThi = models.PcCoiThi || model("PcCoiThi", PcCoiThiSchema);

export default PcCoiThi;
