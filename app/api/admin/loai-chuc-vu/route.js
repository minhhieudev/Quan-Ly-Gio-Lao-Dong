import LoaiChucVu from "@/models/LoaiChucVu";
import { NextResponse } from "next/server";
import { connectToDB } from "@mongodb";

export async function GET() {
    try {
        await connectToDB();
        const loaiChucVu = await LoaiChucVu.find().sort({ tenLoai: 1 });
        return NextResponse.json(loaiChucVu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectToDB();
        const data = await request.json();
        const loaiChucVu = await LoaiChucVu.create(data);
        return NextResponse.json(loaiChucVu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectToDB();
        const { id, ...updateData } = await request.json();
        const loaiChucVu = await LoaiChucVu.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(loaiChucVu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        await LoaiChucVu.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 