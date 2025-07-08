import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  schoolYearStart: {
    type: Date,
  },
  schoolYearEnd: {
    type: Date,
  },
  noty:{
    type: String
  }
});

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

export default Note;
