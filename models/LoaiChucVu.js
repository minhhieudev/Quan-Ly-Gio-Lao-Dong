import mongoose from "mongoose";

const loaiChucVuSchema = new mongoose.Schema({
    tenLoai: {
        type: String,
        required: true,
        unique: true
    },
    moTa: {
        type: String
    }
}, {
    timestamps: true
});

const LoaiChucVu = mongoose.models.LoaiChucVu || mongoose.model('LoaiChucVu', loaiChucVuSchema);
export default LoaiChucVu; 