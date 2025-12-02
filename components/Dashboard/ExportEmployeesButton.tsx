"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getEmployeesWithProfiles } from "@/lib/action/export-employees.action";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";

export default function ExportEmployeesButton() {
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const department = searchParams.get("department");
      const selectedDepartment = department === "all" ? undefined : department || undefined;
      
      // Fetch employee data
      const employeesData = await getEmployeesWithProfiles(selectedDepartment);

      if (!employeesData || employeesData.length === 0) {
        alert("No employee data to export");
        return;
      }

      // Define headers with proper formatting
      const headers = [
        "Sr No",
        "Name",
        "Email",
        "Department",
       
       
       
        "Mobile Number",
        "Address",
        "Native Place",
        "Date of Birth",
        "Degree",
        "Blood Group",
        "Aadhar Number",
        "PAN Number",
        "Bank Account Number",
        "Serious Illness",
        "Father Name",
        "Father Mobile",
        "Spouse Name",
        "Spouse Mobile",
        "Relative Name",
        "Relative Mobile",
        "Relative Address",
        "Work Experience",
        "Legal Proceedings",
      ];

      // Create worksheet data
      const wsData = [
        headers,
        ...employeesData.map((emp) => [
          emp.srNo,
          emp.name,
          emp.email,
          emp.department,
          
        
          emp.mobileNumber,
          emp.address,
          emp.nativePlace,
          emp.dateOfBirth,
          emp.degree,
          emp.bloodGroup,
          emp.aadharNumber,
          emp.panNumber,
          emp.bankAccountNumber,
          emp.seriousIllness,
          emp.fatherName,
          emp.fatherMobile,
          emp.spouseName,
          emp.spouseMobile,
          emp.relativeName,
          emp.relativeMobile,
          emp.relativeAddress,
          emp.workExperience,
          emp.legalProceedings,
        ]),
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 8 },  // Sr No
        { wch: 25 }, // Name
        { wch: 30 }, // Email
        { wch: 20 }, // Department
        
        { wch: 15 }, // Category
        
        { wch: 15 }, // Mobile Number
        { wch: 35 }, // Address
        { wch: 20 }, // Native Place
        { wch: 15 }, // Date of Birth
        { wch: 25 }, // Degree
        { wch: 12 }, // Blood Group
        { wch: 18 }, // Aadhar Number
        { wch: 15 }, // PAN Number
        { wch: 20 }, // Bank Account Number
        { wch: 25 }, // Serious Illness
        { wch: 25 }, // Father Name
        { wch: 15 }, // Father Mobile
        { wch: 25 }, // Spouse Name
        { wch: 15 }, // Spouse Mobile
        { wch: 25 }, // Relative Name
        { wch: 15 }, // Relative Mobile
        { wch: 35 }, // Relative Address
        { wch: 30 }, // Work Experience
        { wch: 30 }, // Legal Proceedings
      ];
      ws["!cols"] = colWidths;

      // Style the header row
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4285F4" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Employees");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const departmentSuffix = selectedDepartment ? `_${selectedDepartment}` : "_All";
      const filename = `Employees_Data${departmentSuffix}_${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting employees:", error);
      alert("Failed to export employee data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export Profile Details
        </>
      )}
    </Button>
  );
}
