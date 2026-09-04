import { prisma } from "@/lib/prisma";

const ADMIN_PASS = process.env.ADMIN_PASS;

export async function DELETE(req) {
  try {
    const { id, password } = await req.json();

    let Empolyees = await prisma.Empolyees.findMany()
    let admins = Empolyees.filter(
      (s) => s.position && s.position.toLowerCase() === "admin"
    );

    let check = admins.find((e) => e["password"] === password)

    if (!check) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const sale = await prisma.sale.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        items: true,
      },
    });


    if (!sale) {
      return Response.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }


    if (sale.isCancelled) {
      return Response.json(
        { error: "Already cancelled" },
        { status: 400 }
      );
    }


    await prisma.$transaction(async (tx) => {

      // Restore medicine stock
      for (const item of sale.items) {

        await tx.medicine.update({
          where: {
            id: item.medicineId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
            lastUpdatedBy: "Admin",
            lastUpdatedAt: new Date(),
          },
        });

      }


      // Mark sale cancelled
      await tx.sale.update({
        where: {
          id: Number(id),
        },
        data: {
          isCancelled: true,
        },
      });

    });


    return Response.json({
      success: true,
      message: "Sale cancelled and stock restored",
    });


  } catch (err) {

    console.error(err);

    return Response.json(
      {
        error: err.message || "Server error",
      },
      {
        status: 500,
      }
    );
  }
}