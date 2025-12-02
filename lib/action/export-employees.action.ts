"use server";

import prisma from "@/lib/prisma";

export async function getEmployeesWithProfiles(department?: string) {
  try {
    const where = department ? { department } : {};

    const employees = await prisma.user.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter to only include employees who have submitted their profile
    const employeesWithProfile = employees.filter(employee => employee.profile !== null);

    return employeesWithProfile.map((employee, index) => ({
      srNo: index + 1,
      name: employee.name,
      email: employee.email,
      department: employee.department,
     
      status: employee.status,
      
      
      mobileNumber: employee.profile?.mobileNumber || "N/A",
      address: employee.profile?.address || "N/A",
      nativePlace: employee.profile?.nativePlace || "N/A",
      dateOfBirth: employee.profile?.dateOfBirth 
        ? new Date(employee.profile.dateOfBirth).toLocaleDateString('en-IN')
        : "N/A",
      degree: employee.profile?.degree || "N/A",
      bloodGroup: employee.profile?.bloodGroup || "N/A",
      aadharNumber: employee.profile?.aadharNumber || "N/A",
      panNumber: employee.profile?.panNumber || "N/A",
      bankAccountNumber: employee.profile?.bankAccountNumber || "N/A",
      seriousIllness: employee.profile?.seriousIllness || "N/A",
      fatherName: employee.profile?.fatherName || "N/A",
      fatherMobile: employee.profile?.fatherMobile || "N/A",
      spouseName: employee.profile?.spouseName || "N/A",
      spouseMobile: employee.profile?.spouseMobile || "N/A",
      relativeName: employee.profile?.relativeName || "N/A",
      relativeMobile: employee.profile?.relativeMobile || "N/A",
      relativeAddress: employee.profile?.relativeAddress || "N/A",
      workExperience: employee.profile?.workExperience || "N/A",
      legalProceedings: employee.profile?.legalProceedings || "N/A",
    }));
  } catch (error) {
    console.error("Error fetching employees with profiles:", error);
    throw new Error("Failed to fetch employee data");
  }
}
