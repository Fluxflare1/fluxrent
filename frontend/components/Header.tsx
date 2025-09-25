// components/Header.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(()=>setUser(null));
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary-700">FluxRent</Link>
        <nav className="flex items-center gap-4">
          <Link href="/properties/listings" className="text-sm">Listings</Link>
          <Link href="/properties/listings?listing_type=RENT" className="text-sm">Rent</Link>
          <Link href="/properties/listings?listing_type=SALE" className="text-sm">Sale</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm">{user.first_name || user.email}</Link>
              <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm">Login</Link>
              <Link href="/auth/request-access" className="text-sm">Request Access</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
