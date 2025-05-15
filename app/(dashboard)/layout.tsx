import type { ReactNode } from "react";
import "../globals.css";

import { AppSidebar } from "@/components/Layout/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/Layout/header";
import { getUser } from "@/lib/action/getUser";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: ReactNode;
  userRole: string;
}

export default async function Layout({ children }: LayoutProps) {
  const user = await getUser();
  return (
    <SidebarProvider>
      <AppSidebar userRole={user?.role || "TEACHER"} />
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4 ">
          <SidebarTrigger className="mr-2" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attendance System
            </h1>
            <Badge
              variant="outline"
              className="text-xs font-medium text-purple-600 border-purple-200"
            >
              BETA
            </Badge>
          </div>
          <div className="justify-end flex-1 flex items-center">
            {user && <Header user={user} />}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
