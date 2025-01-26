import { Schema, model, models } from 'mongoose';

const BieuMauSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BieuMau = models.BieuMau || model('BieuMau', BieuMauSchema);

export default BieuMau;