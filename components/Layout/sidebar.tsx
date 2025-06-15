"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  History,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  UserX,
  User,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";


const SuperadminItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Employees",
    icon: Users,
    href: "/employee",
  },
  {
    title: "History",
    icon: History,
    href: "/ahistory",
  },
  {
    title: "Mark Absent",
    icon: UserX,
    href: "/absent",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Report",
    icon: FileText,
    href: "/report",
  },
  {
    title: "Student Leave",
    icon: Users,
    href: "/student-leave",
  },
  {
    title: "Teacher Leave",
    icon: Users,
    href: "/ateacher-leave",
  },
  {
    title: "Salary Report",
    icon: FileText,
    href: "/salary-report",
  },
];

const adminRole = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Leave",
    icon: Users,
    href: "/teacher-leave",
  },
  {
    title: "Report",
    icon: FileText,
    href: "/report",
  },
];

const Teacher = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Leave",
    icon: Users,
    href: "/teacher-leave",
  },
  {
    title:"Profile",
    icon: User,
    href: "/profile",
  }
];

const TeacherE = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Leave",
    icon: Users,
    href: "/teacher-leave",
  },
  {
    title: "Student Leave",
    icon: Users,
    href: "/student-leave",
  },
];

const Security = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Leave",
    icon: Users,
    href: "/teacher-leave",
  },
  {
    title: "Student Leave",
    icon: Users,
    href: "/s-leave",
  },
];

interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole = "TEACHER" }: AppSidebarProps) {
  const pathname = usePathname();
  let sidebarItems: { title: string; icon: React.ElementType; href: string }[] =
    [];

  if (userRole === "SUPERADMIN") {
    sidebarItems = SuperadminItems;
  } else if (userRole === "ADMIN") {
    sidebarItems = adminRole;
  } else if (userRole === "TEACHER") {
    sidebarItems = Teacher;
  } else if (userRole === "TEACHERE") {
    sidebarItems = TeacherE;
  } else if (userRole === "SECURITY") {
    sidebarItems = Security;
  }

  return (
    <Sidebar className="border-r border-gray-200 ">
      <SidebarHeader className="py-6 px-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#4285f4]">Tapovan School</h1>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="py-6 px-3">
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="mb-3">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`relative overflow-hidden transition-all duration-200 h-12 ${
                        isActive
                          ? "bg-[#d6e8ff] text-[#4285f4] font-semibold rounded-xl"
                          : "hover:bg-[#e6eef8] rounded-xl"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center py-3 px-4"
                      >
                        <item.icon
                          className={`mr-4 h-5 w-5 ${
                            isActive ? "text-[#4285f4]" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-base ${
                            isActive ? "text-[#4285f4]" : "text-gray-700"
                          }`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
