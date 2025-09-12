// frontend/components/landing/LandingNavbar.tsx
import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-800 to-indigo-600 flex items-center justify-center text-white font-bold">
            FR
          </div>
          <div className="text-lg font-semibold">FluxRent</div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="#about" className="hover:text-sky-600">About</Link>
          <Link href="#features" className="hover:text-sky-600">Features</Link>
          <Link href="#pricing" className="hover:text-sky-600">Pricing</Link>
          <Link href="/about" className="hover:text-sky-600">Team</Link>
          <Link
            href="/login"
            className="ml-2 px-4 py-2 rounded-md bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
