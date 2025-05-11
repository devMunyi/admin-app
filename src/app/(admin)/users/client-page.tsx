"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import UsersTable, { User } from "./users-table";
import Button from "@/components/temp-ui/button/Button";
import Input from "@/components/temp-ui/form/input/InputField";
import AddUserModal from "./add-user-modal";
import { DEFAULT_PAGE_SIZE, USER_ROLES, USER_STATUSES } from "@/lib/constants";
import Pagination from "@/components/tables/Pagination";
import { useRouter } from "next/navigation";
import Select from "@/components/temp-ui/form/Select";
import { ChevronDownIcon } from "@/icons";
import { getBranches } from "@/lib/actions/util.action";

type UserFilters = {
  page: number;
  rpp: number;
  branch?: string;
  role?: string;
  status?: string;
  search?: string;
};

type ApiResponse = {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


type UsersClientPageProps = {
  initialBranches: Awaited<ReturnType<typeof getBranches>>;
}

export default function UsersClientPage({
  initialBranches
}: UsersClientPageProps) {

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => getBranches(),
    initialData: initialBranches, // From server
    staleTime: 60 * 1000 * 180, // 3 hours
  });

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rpp, setRpp] = useState(DEFAULT_PAGE_SIZE); // Changed default to match common options
  const [role, setRole] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const filters = {
    page,
    rpp,
    role: role !== "" ? role : undefined,
    branch: branch !== "" ? branch : undefined,
    status: status !== "" ? status : undefined,
    search: search || undefined
  };

  const fetchUsers = async (filters: UserFilters): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append("page", filters.page.toString());
    params.append("limit", filters.rpp.toString());
    if (filters.branch) params.append("branch_id", filters.branch);
    if (filters.role) params.append("role", filters.role);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    const response = await fetch(`/api/users/findMany?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  };

  const { data, isLoading, error, isFetching } = useQuery<ApiResponse>({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    placeholderData: () => queryClient.getQueryData<ApiResponse>(['users', filters]),
    staleTime: 60 * 1000, // 1 minute
  });


  useEffect(() => {
    if (error) {
      router.refresh();
      queryClient.setQueryData<ApiResponse>(['users', filters], undefined);
    }
  }, [error, router]);


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRpp: number) => {
    setRpp(newRpp);
    setPage(1); // Reset to first page when changing rows per page
  };

  // const handleRoleChange = (newRole: string) => {
  //   setRole(newRole);
  // };

  // const handleStatusChange = (newStatus: string) => {
  //   setStatus(newStatus);
  // };

  const handleClearFilters = () => {
    setPage(1);
    setRpp(DEFAULT_PAGE_SIZE);
    setRole("");
    setStatus("");
    setSearch("");
    setBranch("");
    if (searchRef.current) searchRef.current.value = "";
  };

  const handleSearchBtnClick = () => {
    const searchValue = searchRef.current?.value;
    setSearch(searchValue?.trim() || "");
  };

  const handlePageRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    if (page !== 1) setPage(1);
  };

  const handleAddUserClick = () => {
    setIsAddUserModalOpen(true);
  };

  const disabledFilterResetBtn = role === "" && status === "" && !search && page === 1 && rpp === 7 && branch === "";

  return (
    <div className="space-y-1">
      <PageBreadcrumb pageTitle="Users" />

      <ComponentCard title="User List">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between gap-4">
            <div className="flex justify-between gap-4">
              {/* Filters */}
              <div>
                <Button
                  type="button"
                  size="md"
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={disabledFilterResetBtn}
                >
                  Reset Filters
                </Button>
              </div>

              <div>
                <Select
                  options={(initialBranches ?? []).map(b => ({
                    value: String(b.id),
                    label: b.name
                  }))}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder='Select Branch'
                />
              </div>

              <div>
                <Select
                  options={USER_ROLES}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Select Role"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>

              <div>
                <Select
                  value={status}
                  options={USER_STATUSES}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Select Status"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleAddUserClick}>
                Add User
              </Button>
            </div>

            <AddUserModal
              isOpen={isAddUserModalOpen}
              onClose={() => setIsAddUserModalOpen(false)}
              onSuccess={handlePageRefresh}
              initialBranches={branches} // Pass to modal
            />
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-2/3">
              <Input
                placeholder="Search by name or email"
                type="search"
                ref={searchRef}
                className=""
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSearchBtnClick}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 text-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
            Error loading users: {(error as Error).message}
          </div>
        ) : isLoading || isFetching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <>
            <UsersTable
              users={data?.data || []}
              onSucess={handlePageRefresh}
              branches={branches} // Pass to table
            />

            {data?.pagination?.totalPages !== undefined && data.pagination.totalPages > 1 ? (
              <div className="mt-4">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  rowsPerPage={rpp}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </div>
            ) : null}
          </>
        )}

        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={handlePageRefresh}
          initialBranches={initialBranches} // Pass to modal
        />
      </ComponentCard>
    </div>
  );
}