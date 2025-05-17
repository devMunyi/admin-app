// src/app/api/users/[id]/events/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/currentUser";
import { users_status } from "@/generated/prisma";

enum EventType {
    BY = "by", // Events created by this user
    ON = "on"  // Events targeting this user
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const currentUser = await getCurrentUser();

    // Check authentication
    if (!currentUser || !currentUser.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    try {
        // Verify user exists and isn't deleted
        const user = await prisma.users.findUnique({
            where: {
                public_id: userId,
                status: { not: users_status.DELETED }
            },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const sort = searchParams.get("sort") || "desc";
        const eventType = searchParams.get("type") || "by"; // 'by' or 'on'

        // Build the where clause based on event type
        const whereClause = {
            tbl: "users",
            ...(eventType === "by"
                ? { event_by: user.id }    // Events created BY this user
                : { fld: user.id })       // Events targeting (ON) this user
        };

        // Execute parallel queries
        const [events, totalEvents] = await Promise.all([
            prisma.events_log.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    id: sort as 'asc' | 'desc'
                },
                select: {
                    id: true,
                    details: true,
                    event_date: true,
                    status: true,
                    ...(eventType === EventType.BY && { event_by: true }), // Show who created events ON user
                    ...(eventType === EventType.ON && { fld: true })      // Show target of events BY user
                }
            }),
            prisma.events_log.count({
                where: whereClause
            })
        ]);

        return NextResponse.json({
            data: events,
            pagination: {
                page,
                limit,
                total: totalEvents,
                totalPages: Math.ceil(totalEvents / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}