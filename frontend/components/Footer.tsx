// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container mx-auto px-4 py-6 text-sm text-slate-500">
        © {new Date().getFullYear()} FluxRent. All rights reserved.
      </div>
    </footer>
  );
}
