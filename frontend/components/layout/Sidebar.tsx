// frontend/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/manager", label: "Properties", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-4 text-xl font-bold border-b border-slate-700">
        FluxRent
      </div>
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
              pathname.startsWith(href)
                ? "bg-slate-800 text-yellow-400"
                : "hover:bg-slate-800"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
