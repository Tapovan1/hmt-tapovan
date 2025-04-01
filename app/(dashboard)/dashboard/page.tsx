import EmployeeDashboard from "@/components/Dashboard/EmployeeDashboard";
import { getUser } from "@/lib/action/getUser";
import { AdminDashboard } from "@/components/Dashboard/admin-dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: number; year?: number }>;
}) {
  const user = await getUser();
  const { month, year } = (await searchParams) || {};

  if (!user) {
    return null;
  }

  return ["SUPERADMIN", "ADMIN"].includes(user.role) ? (
    <AdminDashboard searchParams={{ month, year }} />
  ) : (
    <EmployeeDashboard user={user} searchParams={{ month, year }} />
  );
}
