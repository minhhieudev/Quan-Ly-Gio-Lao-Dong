import mongoose from "mongoose";

const CongTacCoiThiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ky: {
        type: String,
        required: true,
    },
    ngayThi: {
        type: Date,
        required: true,
    },
    hocPhan: {
        type: String,
        required: true,
    },
    thoiGianThi: {
        type: String,
        required: true,
    },
    soTietQuyChuan: {
        type: Number,
        required: true,
    },
    ghiChu: {
        type: String,
    },
    namHoc: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    hinhThucThoiGianThi: {
        type: String,
    },
}, {
    timestamps: true,
});

const CongTacCoiThi = mongoose.models.CongTacCoiThi || mongoose.model('CongTacCoiThi', CongTacCoiThiSchema);

export default CongTacCoiThi;
