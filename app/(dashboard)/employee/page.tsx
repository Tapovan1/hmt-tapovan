import { getEmployees } from "@/lib/action/user.action"
import EmployeesPage from "./employees-page"

export default async function EmployeesWrapper() {
  const data = await getEmployees()

  return <EmployeesPage employees={data || []} />
}
