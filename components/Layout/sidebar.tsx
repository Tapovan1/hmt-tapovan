"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, History, LayoutDashboard, Settings, Users } from "lucide-react";
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
    icon: Users,
    href: "/absent",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Report",
    icon: Users,
    href: "/report",
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
    href: "/leave",
  },
  {
    title: "Report",
    icon: Users,
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
    href: "/leave",
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
    href: "/leave",
  },
  {
    title: "Student Leave",
    icon: Users,
    href: "/student-leave",
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
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Tapovan School HMT
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-2 py-4">
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="my-1">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-md" />
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
