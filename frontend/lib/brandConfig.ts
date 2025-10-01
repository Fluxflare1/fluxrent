// frontend/lib/brandConfig.ts
export interface Brand {
  name: string;
  domain: string;
  title: string;
  description: string;
  logo: string;
  ogImage: string;
  themeColor: string;
  contact?: { email?: string };
}

export const brands: Record<"fluxrent" | "checkalist", Brand> = {
  fluxrent: {
    name: "FluxRent",
    domain: "fluxrent.com",
    title: "FluxRent — Property & Tenant Platform",
    description:
      "List properties, manage tenants, and collect payments — all from a unified platform.",
    logo: "/logos/fluxrent-logo.svg",
    ogImage: "/og/fluxrent-og.png",
    themeColor: "#2563eb",
    contact: { email: "support@fluxrent.com" },
  },
  checkalist: {
    name: "Checkalist",
    domain: "checkalist.com",
    title: "Checkalist — Collaborative Property Checklists",
    description:
      "Inspect, share, and collaborate on property checklists with tenants and managers.",
    logo: "/logos/checkalist-logo.svg",
    ogImage: "/og/checkalist-og.png",
    themeColor: "#16a34a",
    contact: { email: "support@checkalist.com" },
  },
};
