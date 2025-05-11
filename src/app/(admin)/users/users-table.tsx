import React, { useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/temp-ui/table";
import Badge from "@/components/temp-ui/badge/Badge";
import { DeleteIcon, EyeIcon, PencilIcon, X } from "lucide-react";
import EditUserModal from "./edit-user-modal";
import { capitalizeString } from "@/lib/utils";
// import Button from "@/components/temp-ui/button/Button";
import { users_role, users_status } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import Button from "@/components/temp-ui/button/Button";
import { formatDateString } from "@/lib/dates";
import { getBranches } from "@/lib/actions/util.action";
import AddUserModal from "./add-user-modal";
// import { Button } from "@/components/ui/button";

export type Branch = {
  id: number;
  name: string;
}

export type User = {
  role: users_role;
  status: users_status;
  phone: string;
  national_id: string;
  branch: Branch;
  name: string;
  id: number;
  public_id: string;
  email: string;
  image: string | null;
  created_at: Date;
}


type UsersTableProps = {
  users: User[];
  onSucess?: () => void;
  branches: Awaited<ReturnType<typeof getBranches>>;
}

export default function UsersTable(
  { users, onSucess, branches }: UsersTableProps
) {

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  National ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Branch
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.length > 0 ?
                (users.map((user) => (
                  <TableRow key={user.public_id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
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
                            {capitalizeString(user.role)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.national_id}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.phone}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user?.branch?.name || "N/A"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDateString(user.created_at)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        className="rounded-md"
                        variant="outline"
                        size="md"
                        color={
                          user.status === users_status.ACTIVE
                            ? "success"
                            : user.status === users_status.PENDING
                              ? "warning"
                              : "error"
                        }
                      >
                        {capitalizeString(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 flex items-center gap-2">
                      <Button variant="outline" className="border-brand-500 text-brand-500" title={`Edit ${user.name}`} onClick={() => handleEditClick(user)} size="sm" startIcon={<PencilIcon />}>{""}</Button>
                      <Button variant="outline" className="border-brand-500 text-brand-500" title={`View ${user.name} details`} onClick={() => router.push(`/users/${user.public_id}`)} size="sm" startIcon={<EyeIcon />}>{""}</Button>
                      {/* <Button variant="outline" className="border-brand-500 text-brand-500" title={`View ${user.name} details`} onClick={() => router.push(`/users/${user.public_id}`)} size="sm" startIcon={<X />}>{""}</Button> */}

                      {/* <Button title={`Edit ${user.name}`} className="border-brand-500 hover:bg-brand-300 dark:hover:bg-white" size="default" variant="outline"><PencilIcon className="text-brand-500" onClick={() => handleEditClick(user)} /></Button>

                      <Button title={`View ${user.name} details`} className="border-brand-500 " size="default" variant="outline"><EyeIcon className="text-brand-500" onClick={() => router.push(`/users/${user.public_id}`)} /></Button> */}

                    </TableCell>
                  </TableRow>
                )))
                : (
                  <TableRow>
                    <TableCell
                      className="col-span-3 px-4 py-6"
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onSucess}
        branches={branches}
        user={
          selectedUser
            ? {
              id: selectedUser.id,
              name: selectedUser.name,
              phone: selectedUser.phone,
              national_id: (selectedUser as any).national_id ?? "",
              branch: (selectedUser as any).branch,
              email: selectedUser.email,
              role: selectedUser.role,
              status: selectedUser.status,
            }
            : null
        }
      />
    </div>
  );
}
