"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { Bell, Search, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  sidebarColor?: string; // theme color per role
}

export default function DashboardLayout({
  children,
  title,
  navItems,
  sidebarColor = "bg-indigo-700",
}: DashboardLayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 w-1/3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <User className="w-6 h-6 text-gray-600" />
                <span className="hidden md:inline text-gray-700">John Doe</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => console.log("Logout")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
