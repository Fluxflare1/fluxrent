// frontend/app/page.tsx
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingSponsors from "@/components/landing/LandingSponsors";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingTestimonials />
      <LandingSponsors />
      <footer className="py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} FluxRent — Tenant & Property Management
      </footer>
    </main>
  );
}
