import { getEmployees } from "@/lib/action/user.action"
import EmployeesPage from "./employees-page"

export default async function EmployeesWrapper({
  searchParams,

}:{
  searchParams: { department?: string }
}) {
  const params = await searchParams;

  const selectedDepartment = params.department === "all" ? undefined : params.department 
  //@ts-expect-error
  const data = await getEmployees(selectedDepartment)

  return <EmployeesPage employees={data || []} />
}