import { prisma } from "@/lib/prisma";

const ADMIN_PASS = process.env.ADMIN_PASS;

export async function DELETE(req) {
  try {
    const body = await req.json();

    const { id, password } = body;

    let Empolyees = await prisma.Empolyees.findMany()
    let admins = Empolyees.filter(
      (s) => s.position && s.position.toLowerCase() === "admin"
    );

    let check = admins.find((e) => e["password"] === password)

    if (!check) {
      return Response.json(
        { error: "Wrong password" },
        { status: 401 }
      );
    }

    if (!id) {
      return Response.json(
        { error: "Medicine id is required" },
        { status: 400 }
      );
    }

    await prisma.medicine.update({
      where: {
        id: Number(id)
      },
      data: {
        active: false,
        stock: 0
      }
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}