// import { Suspense } from "react";
// import type { Metadata } from "next";

// import { StudentAbsenceTable } from "./student-absence-table";
// import { StudentAbsenceDialog } from "./student-absence-dialog";
// import { Users, Loader2 } from "lucide-react";
// import { DateSelector } from "./date-selector";

// export const metadata: Metadata = {
//   title: "Student Absence Management",
//   description: "Manage student absences and leaves",
// };

// export default async function StudentAbsencePage({
//   searchParams,
// }: {
//   searchParams: { date?: Date };
// }) {
//   const { date } = await searchParams;

//   const selectedDateString = date || new Date().toISOString().split("T")[0];
//   // const selectedDate = new Date(selectedDateString);

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
//         {/* Title + Icon */}
//         <div className="flex items-center gap-2">
//           <div className="bg-[#e6eef8] p-2 rounded-full">
//             <Users className="h-6 w-6 text-[#4285f4]" />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//             Student Leave Management
//           </h1>
//         </div>

//         {/* Date selector and add button in column on mobile */}
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
//           <DateSelector initialDate={selectedDateString} />
//           <StudentAbsenceDialog />
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">
//           Student Leave Records
//         </div>
//         <Suspense
//           fallback={
//             <div className="w-full py-16 flex items-center justify-center">
//               <div className="flex flex-col items-center gap-3">
//                 <Loader2 className="h-8 w-8 animate-spin text-[#4285f4]" />
//                 <p className="text-gray-500">Loading student data...</p>
//               </div>
//             </div>
//           }
//         >
//           <StudentAbsenceTable selectedDate={selectedDateString} />
//         </Suspense>
//       </div>
//     </div>
//   );
// }

import React from "react";
import UnderDevelopment from "@/components/under-development";

const page = () => {
  return (
    <div>
      <UnderDevelopment />
    </div>
  );
};

export default page;
