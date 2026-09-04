import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { id, costPrice, sellingPrice, name, password } =
      await req.json();

    let Empolyees = await prisma.Empolyees.findMany()
    let admins = Empolyees.filter(
      (s) => s.position && s.position.toLowerCase() === "admin"
    );

    let check = admins.find((e)=>e["password"] === password)

    if (!check) {
      return NextResponse.json(
        { error: "Wrong password" },
        { status: 401 }
      );
    }

    await prisma.medicine.update({
      where: {
        id: Number(id),
      },
      data: {
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        lastUpdatedBy: name,
        lastUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}