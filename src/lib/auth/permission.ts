import { Prisma, users_role } from "@/generated/prisma";
import { ALLOWED_ACTIONS, PERMISSION_COLUMNS } from "../constants";
import prisma from "../prisma";

export default async function hasPermission(
    user: { id: number; role: users_role },
    tbl: string,
    act: string,
    rec = 0
): Promise<boolean> {
    try {
        if (!user || !ALLOWED_ACTIONS.includes(act)) {
            return false;
        }

        const userId = user.id;
        const userRole = user.role;
        if (!userRole) {
            return false;
        }

        // super admin always have access
        if (userRole === users_role.SUPER_ADMIN) {
            return true;
        } else {
            console.log("User role:", userRole);
        }

        // Check if `act` is a permission column
        const isColumn = PERMISSION_COLUMNS.includes(act);

        // Build the where condition
        const whereConditions: Prisma.permissionsWhereInput = {
            OR: [
                { role: userRole },
                { user_id: userId }
            ],
            tbl: tbl,
            rec: rec
        };

        if (isColumn) {
            // ignore any
            /* eslint-disable @typescript-eslint/no-explicit-any */
            (whereConditions as any)[act] = 1;
        } else {

            /* eslint-disable @typescript-eslint/no-explicit-any */
            (whereConditions as any)['custom_action'] = act;
        }

        const result = await prisma.permissions.findFirst({
            where: whereConditions,
            select: { id: true }
        });

        return result !== null;
    } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
    }
}