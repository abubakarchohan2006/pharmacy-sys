import { prisma } from "@/lib/prisma";

export async function PUT(req) {
  try {
    const { id, quantity, name, password } = await req.json();

    const STAFF = await prisma.Empolyees.findMany()

    // Validate staff credentials
    const staff = STAFF.find(
      (s) => s.name === name && s.password === password
    );

    if (!staff) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if medicine exists
    const med = await prisma.medicine.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!med) {
      return Response.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    // Increase stock
    const updatedMed = await prisma.medicine.update({
      where: {
        id: Number(id),
      },
      data: {
        stock: {
          increment: Number(quantity),
        },
        lastUpdatedBy: name,
        lastUpdatedAt: new Date(),
      },
    });

    return Response.json(updatedMed);
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}