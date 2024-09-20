import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
