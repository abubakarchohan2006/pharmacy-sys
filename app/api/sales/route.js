import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { items, name, password } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!name || !password) {
      return NextResponse.json(
        { error: "Staff credentials required" },
        { status: 400 }
      );
    }

    const STAFF = await prisma.Empolyees.findMany()

    // Find staff member by name and verify password
    const staff = STAFF.find(
      (s) => s.name === name && s.password === password
    );

    if (!staff) {
      return NextResponse.json(
        { error: "Invalid staff credentials" },
        { status: 401 }
      );
    }

    const billNo = Date.now();

    const result = await prisma.$transaction(async (tx) => {

      let totalAmount = 0;
      let totalProfit = 0;

      const saleItems = [];

      for (const item of items) {

        const medicine = await tx.medicine.findUnique({
          where: {
            id: Number(item.medicineId),
          },
        });


        if (!medicine) {
          throw new Error(
            `${item.name || "Medicine"} not found`
          );
        }


        if (Number(item.quantity) > medicine.stock) {
          throw new Error(
            `Not enough stock for ${medicine.name}`
          );
        }


        await tx.medicine.update({
          where: {
            id: medicine.id,
          },
          data: {
            stock: {
              decrement: Number(item.quantity),
            },
            lastUpdatedBy: name,
            lastUpdatedAt: new Date(),
          },
        });


        const quantity = Number(item.quantity);
        const sellingPrice = Number(item.sellingPrice);
        const costPrice = Number(item.costPrice);

        const discount = Number(item.discount || 0);


        const grossAmount =
          sellingPrice * quantity;


        const finalAmount =
          grossAmount - discount;


        const profit =
          finalAmount -
          (costPrice * quantity);


        totalAmount += finalAmount;
        totalProfit += profit;


        saleItems.push({
          medicineId: medicine.id,

          quantity,

          sellingPrice,

          costPrice,

          discount,

          finalAmount,

          profit,
        });

      }


      const sale = await tx.sale.create({
        data: {

          billNo,

          totalAmount,

          totalProfit,

          staffName: name,

          items: {
            create: saleItems,
          },

        },

        include: {
          items: true,
        },

      });


      return sale;

    });


    return NextResponse.json({
      success: true,
      billNo: result.billNo,
      totalAmount: result.totalAmount,
      totalProfit: result.totalProfit,
    });


  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        isCancelled: false,
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(sales);

  } catch (err) {
    console.error(err);

    return Response.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}