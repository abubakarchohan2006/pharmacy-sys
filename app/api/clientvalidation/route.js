import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    let data = await prisma.Owner.findMany()
    let today = new Date()

    if (!data[0]) {
        return NextResponse.json(false)
    }

    let checking = data[0]["date"].getMonth() === today.getMonth() && data[0]["date"].getMonth() === today.getMonth() && data[0]["apidate"].getMonth() === today.getMonth()

    if (checking) {
        return NextResponse.json(data[0])
    }

    return NextResponse.json(false)
}

export async function POST(req) {
    let data = await req.json()
    let result = await data

    let trun = await prisma.Owner.deleteMany({})

    let puindb = await prisma.Owner.create({
        data: {
            userid: result.userid,
            date: new Date,
            status: false,
            apidate: new Date
        }
    })

    const response = await fetch(process.env.EXTERNAL_AUTH_API);
    const listofclient = await response.json();

    const client = listofclient.data.reqs.find(
        (e) => e.userid === result.userid
    );

    if (!client) {
        return NextResponse.json(false);
    }

    await prisma.owner.update({
        where: { userid: result["userid"] },
        data: {
            status: client["status"],
        },
    });

    return NextResponse.json(true)
}

export async function DELETE(req) {
     let data = await req.json()
    let result = await data

    if (!result) {
        return NextResponse.json(false)
    }

    let ownertable = await prisma.Owner.findMany()
    let owner = ownertable[0]

    if(owner["userid"] === result){
        let del = await prisma.Owner.deleteMany({})
    }

    return NextResponse.json(true)
}