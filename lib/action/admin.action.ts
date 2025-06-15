"use server"

import prisma from "../prisma"



export async function getEmployees() {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        profile: {
          select: {
            mobileNumber: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return employees
  } catch (error) {
    console.error("Error fetching employees:", error)
    return []
  }
}

export async function getEmployeeById(id: string) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        profile: true,
      },
    })

    return employee
  } catch (error) {
    console.error("Error fetching employee:", error)
    return null
  }
}
