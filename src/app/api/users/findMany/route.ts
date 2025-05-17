import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma, shared_status, users_role, users_status } from "@/generated/prisma";
import { getPositiveIntParam } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/currentUser";
import hasPermission from "@/lib/auth/permission";
import { SafeUser } from "@/lib/types";

function parseUserSearchParams(params: URLSearchParams) {
  const result = {
    page: parseInt(params.get("page") || "1"),
    limit: parseInt(params.get("limit") || "10"),
    branch_id: getPositiveIntParam(params, "branch_id"),
    role: params.get("role") as users_role || undefined,
    status: params.get("status") as users_status || undefined,
    search: params.get("search") || undefined,
  };

  // Validate page and limit
  if (result.page < 1) result.page = 1;
  if (result.limit < 1 || result.limit > 100) result.limit = 10;

  return result;
}

export async function GET(request: Request) {

  const loggedInUser = await getCurrentUser() as SafeUser;
  // Check authentication
  if (!loggedInUser || !loggedInUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPermitted = await hasPermission(loggedInUser, "users", "read");
  if (!isPermitted) {
    return NextResponse.json({ message: "You don't have permission to view users!" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, branch_id, role, status, search } = parseUserSearchParams(searchParams);

  const where: Prisma.usersWhereInput = {
    ...(branch_id && { branch_id }),
    ...(role && { role }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { national_id: { contains: search } },
        { branch: { name: { contains: search } } },
      ],
    }),
  };

  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        public_id: true,
        name: true,
        email: true,
        phone: true,
        national_id: true,
        branch: {
          select: {
            id: true,
            name: true
          },
          where: {
            status: { not: shared_status.DELETED }
          },
        },
        role: true,
        image: true,
        status: true,
        created_at: true,
      }
    }),
    prisma.users.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
