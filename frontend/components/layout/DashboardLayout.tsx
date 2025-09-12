"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

interface NavItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  sidebarColor?: string;
}

export default function DashboardLayout({
  children,
  title,
  navItems,
  sidebarColor = "bg-indigo-700",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar title={title} navItems={navItems} sidebarColor={sidebarColor} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
