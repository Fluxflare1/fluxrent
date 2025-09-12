"use client";

import { useState } from "react";
import { Bell, Search, User } from "lucide-react";

export default function Topbar() {
  const [search, setSearch] = useState("");

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
      {/* Search */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-1/3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 bg-transparent outline-none flex-1 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-800">
            U
          </div>
          <span className="text-sm font-medium text-gray-700">User</span>
        </div>
      </div>
    </header>
  );
}
