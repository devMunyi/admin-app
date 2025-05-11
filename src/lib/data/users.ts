import axios from "axios";
import { PaginatedResponse } from "../types";

export const fetchUsers = async ({
  page,
  limit,
  role,
  status,
  search,
}: {
  page: number;
  limit: number;
  role?: string;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (role) params.append("role", role);
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const { data } = await axios.get<PaginatedResponse>(
    `/api/users/findMany?${params.toString()}`
  );
  return data;
};

export const fetchUserById = async (id: string) => {
  const { data } = await axios.get(`/api/users/${id}`);
  return data;
}
