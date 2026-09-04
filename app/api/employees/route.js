import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    let inputs = await req.json()

    if (!inputs["userid"]) {
        return NextResponse.json(false)
    }

    let ownerdetails = await prisma.Owner.findMany()

    if (ownerdetails[0]["userid"] != inputs["userid"]) {
        return NextResponse.json(false)
    }

    let data = await prisma.Empolyees.create({
        data: {
            name: `${inputs.name}`,
            position: `${inputs.position}`,
            password: `${inputs.password}`
        }
    })
    return Response.json({ "mess": "success" });
}

export async function GET() {
    let data = await prisma.Empolyees.findMany();
    return NextResponse.json(data);
}

export async function DELETE(req) {
    let inputs = await req.json()

    if (!inputs["userid"]) {
        return NextResponse.json(false)
    }

    let ownerdetails = await prisma.Owner.findMany()

    if (ownerdetails[0]["userid"] !== inputs["userid"]) {
        return NextResponse.json(false)
    }

    let data = await prisma.Empolyees.delete({
        where: { id: parseInt(inputs.id, 10) }
    })
    return NextResponse.json({ "mess": "success" });
}