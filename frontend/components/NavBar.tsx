"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function NavBar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/auth/me/")
      .then((data) => setRole(data.role))
      .catch(() => setRole(null));
  }, []);

  return (
    <nav className="flex gap-4 p-2 bg-gray-100 border-b">
      <Link href="/">Home</Link>
      {role === "ADMIN" && (
        <>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/users">Users</Link>
        </>
      )}
      {role === "MANAGER" && <Link href="/manager/properties">Properties</Link>}
      {role === "TENANT" && <Link href="/tenant/portal">Tenant Portal</Link>}
    </nav>
  );
}
