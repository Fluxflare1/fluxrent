// frontend/app/dashboard/owner/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // simple classnames util if not already

const navItems = [
  { href: "/dashboard/owner", label: "Dashboard" },
  { href: "/dashboard/owner/users", label: "Users" },
  { href: "/dashboard/owner/notifications", label: "Notifications" },
  { href: "/dashboard/owner/settings", label: "Settings" },
];

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          FluxRent Admin
        </div>
        <nav className="flex-1 p-2 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded hover:bg-gray-800 transition",
                pathname === item.href ? "bg-gray-800 font-semibold" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FluxRent
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white border-b p-4">
          <h1 className="text-lg font-semibold">Owner Admin Panel</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
