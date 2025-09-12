// frontend/components/landing/LandingSponsors.tsx
export default function LandingSponsors() {
  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-slate-500 mb-6">Integrations & partners</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-slate-400">Google Sheets</div>
          <div className="text-slate-400">Stripe</div>
          <div className="text-slate-400">GMail</div>
          <div className="text-slate-400">Zapier</div>
        </div>
      </div>
    </section>
  );
}
