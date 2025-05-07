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
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
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
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border py-5">
        <div className="px-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Tapovan School
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="py-6 px-3">
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="mb-2">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`relative overflow-hidden transition-all duration-200 ${
                        isActive
                          ? "bg-primary/15 text-primary font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center py-2.5"
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`${
                            isActive
                              ? "text-primary"
                              : "text-sidebar-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute left-0 top-0 h-full w-1.5 bg-primary rounded-r-md" />
                        )}
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
