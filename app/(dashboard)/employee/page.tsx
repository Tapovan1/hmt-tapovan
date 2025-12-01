import { getEmployees } from "@/lib/action/user.action"
import { checkProfileExists } from "@/lib/action/profile.action"
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

  // Check profile status for each employee
  const employeesWithProfileStatus = await Promise.all(
    (data || []).map(async (employee) => {
      const hasProfile = await checkProfileExists(employee.id)
      return {
        ...employee,
        hasProfile
      }
    })
  )

  return <EmployeesPage employees={employeesWithProfileStatus} />
}