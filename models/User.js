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

  maGV: {
    type: String,
  },
 

});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
