import mongoose from "mongoose";

const Settingchema = new mongoose.Schema({
  schoolYearStart: {
    type: Date,
  },
  schoolYearEnd: {
    type: Date,
  },
  noty: {
    type: String
  },
  startRegulation: {
    type: Date,
  },
  endRegulation: {
    type: Date,
  },
});

const Setting = mongoose.models.Setting || mongoose.model("Setting", Settingchema);

export default Setting;
