import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name,
      supplier,
      costPrice,
      sellingPrice,
      stock,
      lastUpdatedBy,
      password,
    } = body;

    const STAFF = await prisma.Empolyees.findMany()

    // Find staff member by name and verify password
    const staffMember = STAFF.find(
      (s) => s.name === lastUpdatedBy && s.password === password
    );

    if (!staffMember) {
      return Response.json(
        { error: "Invalid staff credentials" },
        { status: 401 }
      );
    }

    const med = await prisma.medicine.create({
      data: {
        name,
        supplier: supplier || null,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock),
        lastUpdatedBy,
        lastUpdatedAt: new Date(),
      },
    });

    return Response.json(med, { status: 201 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const meds = await prisma.medicine.findMany({
      where: {
        active: true
      },
      orderBy: {
        id: "desc"
      }
    });

    return Response.json(meds);
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}