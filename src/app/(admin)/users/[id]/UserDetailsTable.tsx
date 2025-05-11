import { UserInfo } from "@/components/events/type";
import Badge from "@/components/temp-ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/temp-ui/table";
import { users_status } from "@/generated/prisma";
import { formatDateString, toRelativeTime } from "@/lib/dates";
import { capitalizeString } from "@/lib/utils";
import Image from "next/image";

export const UserDetailsTable: React.FC<{ user: UserInfo }> = ({ user }) => {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Field
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Value
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <TableRow>
                            <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                Profile
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 overflow-hidden rounded-full">
                                        <Image
                                            width={40}
                                            height={40}
                                            src={user.image || "/images/user/user-17.jpg"}
                                            alt={user.name}
                                        />
                                    </div>
                                    <div>
                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {user.name}
                                        </span>
                                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                Role
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                {capitalizeString(user.role)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                Status
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                <Badge
                                    variant="solid"
                                    size="sm"
                                    color={
                                        user.status === users_status.ACTIVE
                                            ? "success"
                                            : user.status === users_status.PENDING
                                                ? "warning"
                                                : "error"
                                    }
                                >
                                    {user.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                Created At
                            </TableCell>
                            <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                {formatDateString(user.created_at)}
                                <Badge variant="outline" size="sm" className="ml-2">
                                    {toRelativeTime(user.created_at)}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
