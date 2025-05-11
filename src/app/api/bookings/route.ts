//  Booking CRUD

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { quoteId, agentId } = await req.json();

    // Validate required fields
    if (!quoteId || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields: quoteId and agentId are required" },
        { status: 400 }
      );
    }

    // Fetch the quote with related data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rateCard: {
          include: {
            hotel: true,
            rackRate: true,
          },
        },
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Verify the agent exists
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Generate booking reference (example: BK-20230413-0001)
    const bookingRef = `BK-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the booking with all required relationships
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        status: "CONFIRMED",
        travelDate: new Date(), // Default to today, should be customized
        returnDate: new Date(Date.now() + 7 * 86400000), // 7 days later
        mealPlan: quote.rateCard.mealPlan,
        roomCategory: quote.rateCard.roomCategory,

        // Relationships
        quote: { connect: { id: quoteId } },
        client: { connect: { id: quote.clientId } },
        hotel: { connect: { id: quote.rateCard.hotelId } },
        agent: { connect: { id: agentId } },

        // Create related invoice
        invoice: {
          create: {
            invoiceNumber: `INV-${Date.now()}`,
            quote: { connect: { id: quoteId } },
            client: { connect: { id: quote.clientId } },
            amount: quote.rateCard.finalRate,
            taxAmount: 0, // Could be calculated
            totalAmount: quote.rateCard.finalRate,
            dueDate: new Date(Date.now() + 7 * 86400000), // 7 days
            status: "UNPAID",
          },
        },
      },
      include: {
        quote: {
          include: {
            rateCard: {
              include: {
                hotel: true,
              },
            },
          },
        },
        client: true,
        hotel: true,
        agent: true,
        invoice: true,
      },
    });

    // Update the quote status to CONVERTED
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: "CONVERTED" },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
