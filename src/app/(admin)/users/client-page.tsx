"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import UsersTable from "./users-table";
import Button from "@/components/temp-ui/button/Button";
import Input from "@/components/temp-ui/form/input/InputField";
import AddUserModal from "./add-user-modal";
import { DEFAULT_PAGE_SIZE, USER_ROLES, USER_STATUSES } from "@/lib/constants";
import Pagination from "@/components/tables/Pagination";
import { useRouter } from "next/navigation";
import Select from "@/components/temp-ui/form/Select";
import { getBranches } from "@/lib/actions/util.action";
import { FindUsersApiResponse, UsersClientPageProps } from "@/lib/types";
import { useUsersQuery } from "@/lib/services/api/users/queries";

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
  const searchTimeoutRef = useRef<number | undefined>(undefined); // Changed to `number` for Bun compatibility

  const disabledFilterResetBtn = useMemo(() =>
    role === "" && status === "" && !search && page === 1 && rpp === DEFAULT_PAGE_SIZE && branch === "",
    [role, status, search, page, rpp, branch]
  );

  const filters = useMemo(() => ({
    page,
    rpp,
    role: role !== "" ? role : undefined,
    branch: branch !== "" ? branch : undefined,
    status: status !== "" ? status : undefined,
    search: search || undefined
  }), [page, rpp, role, branch, status, search]);

  const { data, isLoading, error, isFetching } = useUsersQuery(filters);

  useEffect(() => {
    if (error) {
      router.refresh();
      queryClient.setQueryData<FindUsersApiResponse>(['users', filters], undefined);
    }
  }, [error, router]);

  const branchOptions = useMemo(() =>
    (initialBranches ?? []).map(b => ({
      value: String(b.id),
      label: b.name
    })),
    [initialBranches]);


  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);


  const handleRowsPerPageChange = useCallback((newRpp: number) => {
    setRpp(newRpp);
    setPage(1);
  }, []);


  const handleClearFilters = useCallback(() => {
    setPage(1);
    setRpp(DEFAULT_PAGE_SIZE);
    setRole("");
    setStatus("");
    setSearch("");
    setBranch("");
    if (searchRef.current) searchRef.current.value = "";
  }, []);

  const handleSearchBtnClick = useCallback(() => {
    const searchValue = searchRef.current?.value;
    setSearch(searchValue?.trim() || "");
  }, []);

  const handlePageRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    if (page !== 1) setPage(1);
  }, [page, queryClient]);

  const handleAddUserClick = useCallback(() => {
    setIsAddUserModalOpen(true);
  }, []);


  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Update input value without triggering state yet
    if (searchRef.current) {
      searchRef.current.value = e.target.value;
    }

    // Set up debounce (500ms delay)
    searchTimeoutRef.current = window.setTimeout(() => {
      const searchValue = e.target.value;
      setSearch(searchValue.trim() || "");
    }, 500);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-1">
      <PageBreadcrumb pageTitle="Users" />

      <ComponentCard title="User List">
        <div className="flex flex-col gap-4 mb-4 flex-wrap">
          <div className="flex justify-between gap-4 flex-wrap">
            <div className="flex justify-between gap-4 flex-wrap">
              {/* Filters */}
              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={disabledFilterResetBtn}
                >
                  Reset Filters
                </Button>
              </div>

              <div>
                <Select
                  options={branchOptions}
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
              </div>

              <div>
                <Select
                  value={status}
                  options={USER_STATUSES}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Select Status"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleAddUserClick}>
                Add User
              </Button>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <div className="w-2/3">
              <Input
                placeholder="Search by name or email"
                type="search"
                ref={searchRef}
                className="h-9.5"
                onChange={handleSearchInputChange}
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
            {(error as Error).message}
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

      </ComponentCard>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handlePageRefresh}
        initialBranches={initialBranches} // Pass to modal
      />
    </div>
  );
}