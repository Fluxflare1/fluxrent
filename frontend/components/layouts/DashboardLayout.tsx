"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  sidebarColor?: string; // allows theme per role
}

export default function DashboardLayout({
  children,
  title,
  navItems,
  sidebarColor = "bg-indigo-700",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`w-64 ${sidebarColor} text-white flex flex-col`}>
        <div className="px-6 py-6 text-2xl font-bold border-b border-white/20">
          {title}
        </div>
        <nav className="flex-1 px-4 py-6 space-y-4">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="block hover:text-gray-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
