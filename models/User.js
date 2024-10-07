import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  khoa: {
    type: String,
  },
  password: {
    type: String,
    default: "123456@",
  },
  profileImage: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "user",
  },


  donViQuanLy: {
    type: String,
  },
  maNgach: {
    type: String,
  },
  hocHamHocVi: {
    type: String,
  },
  dinhMucGioChuan: {
    type: Number,
  },
  chucVuChinhQuyen: {
    type: String,
    default: "Không"
  },
  chucVuKiemNhiem: {
    type: String,
    default: "Không"

  },
  chucVuDoanTheXH: {
    type: String,
    default: "Không"

  },

  maGV: {
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
