"use client";

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Brand Logo / Name */}
      <div className="text-xl font-bold tracking-wide">🏢 FluxRent</div>

      {/* Navigation */}
      <div className="space-x-6 text-sm font-medium">
        <Link href="#about" className="hover:text-blue-300">About</Link>
        <Link href="#features" className="hover:text-blue-300">Features</Link>
        <Link href="#pricing" className="hover:text-blue-300">Pricing</Link>
        <Link href="/login" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-md hover:bg-yellow-300">
          Login
        </Link>
      </div>
    </nav>
  );
}
