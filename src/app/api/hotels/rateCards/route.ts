// Generate sellable rates
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { baseRate, markupRate, hotelId, createdById, rackRateId } =
      await req.json();

    // Validate required fields
    if (!baseRate || !hotelId || !createdById || !rackRateId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (baseRate, hotelId, createdById, rackRateId)",
        },
        { status: 400 }
      );
    }

    // Create the rate card
    const rateCard = await prisma.rateCard.create({
      data: {
        name: `Rate Card ${new Date().toISOString().slice(0, 10)}`,
        baseRate,
        markupRate: markupRate || 0,
        finalRate: baseRate * (1 + (markupRate || 0) / 100),
        currency: "USD",
        travelPeriod: "HIGH_SEASON", // Using enum value
        mealPlan: "FULL_BOARD", // Using enum value
        roomCategory: "STANDARD", // Using enum value
        isActive: true,
        hotel: { connect: { id: hotelId } },
        rackRate: { connect: { id: rackRateId } },
        createdBy: { connect: { id: createdById } },
      },
      include: {
        hotel: true,
        rackRate: true,
        createdBy: true,
      },
    });

    return NextResponse.json(rateCard);
  } catch (error) {
    console.error("Error creating rate card:", error);
    return NextResponse.json(
      { error: "Failed to create rate card" },
      { status: 500 }
    );
  }
}
