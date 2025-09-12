"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  title: string;
  navItems: NavItem[];
  sidebarColor?: string;
}

export default function Sidebar({ title, navItems, sidebarColor = "bg-indigo-700" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-64 ${sidebarColor} text-white flex flex-col`}>
      {/* Logo / Title */}
      <div className="px-6 py-6 text-2xl font-bold border-b border-white/20">
        {title}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={cn(
              "block px-3 py-2 rounded-lg hover:bg-white/10",
              pathname === item.href ? "bg-white/20 font-semibold" : ""
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
