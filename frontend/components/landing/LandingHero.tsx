// frontend/components/landing/LandingHero.tsx
export default function LandingHero() {
  return (
    <section className="bg-gradient-to-b from-sky-900 to-sky-800 text-white py-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Simplify property & tenant management.
          </h1>
          <p className="text-lg text-slate-100 mb-6 max-w-2xl">
            FluxRent helps property owners, managers and tenants stay in sync — manage units, collect rent, issue receipts and handle maintenance from one modern platform.
          </p>

          <div className="flex gap-4">
            <a
              href="#features"
              className="inline-block bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300"
            >
              Explore Features
            </a>
            <a
              href="/login"
              className="inline-block border border-white px-6 py-3 rounded-lg hover:bg-white/10"
            >
              Login / Request Access
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          {/* Simple inline illustration (SVG) */}
          <svg width="420" height="300" viewBox="0 0 840 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
            <rect x="40" y="120" width="320" height="200" rx="12" fill="#ffffff10"/>
            <rect x="480" y="90" width="320" height="220" rx="12" fill="#ffffff10"/>
            <g transform="translate(80,150)">
              <rect width="120" height="24" rx="6" fill="#fff"/>
              <rect y="40" width="200" height="120" rx="8" fill="#fff"/>
            </g>
            <g transform="translate(520,110)">
              <rect width="200" height="40" rx="8" fill="#fff"/>
              <rect y="70" width="120" height="120" rx="8" fill="#fff"/>
            </g>
            <g transform="translate(360,300)">
              <circle cx="60" cy="-50" r="60" fill="#fff"/>
              <rect x="140" y="-90" width="220" height="120" rx="12" fill="#fff"/>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
