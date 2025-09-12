// frontend/components/layout/Topbar.tsx
"use client";
import { useState } from "react";
import { Bell, Search, User } from "lucide-react";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 flex items-center justify-between px-6 py-3">
      {/* Search */}
      <div className="flex items-center gap-2 w-1/2">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 px-2 py-1 outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <User className="w-6 h-6 text-slate-600" />
            <span className="text-slate-700 font-medium">Admin</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-10">
              <a
                href="/profile"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Settings
              </a>
              <a
                href="/logout"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
