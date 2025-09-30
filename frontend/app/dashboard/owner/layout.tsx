"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

// Lucide icons
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/owner/users", label: "Users", icon: Users },
  { href: "/dashboard/owner/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/owner/settings", label: "Settings", icon: Settings },
];

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gray-900 text-white flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && <span className="text-2xl font-bold">FluxRent</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-gray-800"
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-800 transition",
                pathname === href ? "bg-gray-800 font-semibold" : ""
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          {!collapsed && <p>&copy; {new Date().getFullYear()} FluxRent</p>}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white border-b p-4 flex items-center">
          <h1 className="text-lg font-semibold">Owner Admin Panel</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
