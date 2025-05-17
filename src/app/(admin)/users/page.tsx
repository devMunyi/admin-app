// app/users/page.tsx
import { APP_NAME } from "@/lib/constants";
import UsersClientPage from "./client-page";
import { Metadata } from "next";
import { getBranches } from "@/lib/actions/util.action";

export const metadata: Metadata = {
  title: `${APP_NAME} | users`,
  description: `${APP_NAME} - users`,
};

export default async function UsersPage() {
  const branches = await getBranches(); // Server-side fetch
  return <UsersClientPage initialBranches={branches} />
}