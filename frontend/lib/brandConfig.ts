// frontend/lib/brandConfig.ts
export type Brand = {
  name: string;
  domain: string;
  title: string;
  description: string;
  themeColor: string;
  logo: string; // public/ path (e.g. /branding/fluxrent-logo.svg)
  ogImage: string; // public/ path for OG image
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  social?: string[]; // optional social/profile links
};

export const brands: { fluxrent: Brand; checkalist: Brand } = {
  fluxrent: {
    name: "FluxRent",
    domain: "fluxrent.com",
    title: "FluxRent — Property & Rent Management Platform",
    description:
      "FluxRent helps landlords, tenants, and managers with property management, rent collection, listings, and payments.",
    themeColor: "#2563EB",
    logo: "/branding/fluxrent-logo.svg",
    ogImage: "/branding/fluxrent-og.png",
    contact: {
      email: "support@fluxrent.com",
    },
    social: ["https://twitter.com/fluxrent"],
  },
  checkalist: {
    name: "Checkalist",
    domain: "checkalist.com",
    title: "Checkalist — Browse & Find Properties Easily",
    description:
      "Discover properties for rent, lease, and sale with Checkalist. Filter, search, and explore listings with ease.",
    themeColor: "#10B981",
    logo: "/branding/checkalist-logo.svg",
    ogImage: "/branding/checkalist-og.png",
    contact: {
      email: "hello@checkalist.com",
    },
    social: ["https://twitter.com/checkalist"],
  },
};
