"use client";

import { Home, CreditCard, Wrench, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Property Management",
    description: "Easily add and manage multiple properties with all details in one place."
  },
  {
    icon: CreditCard,
    title: "Online Payments",
    description: "Secure rent collection with instant payment tracking and receipts."
  },
  {
    icon: Wrench,
    title: "Maintenance Requests",
    description: "Streamline tenant maintenance requests and track resolutions."
  },
  {
    icon: MessageSquare,
    title: "Tenant Communication",
    description: "Centralized messaging to keep managers and tenants connected."
  },
];

export default function LandingFeatures() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Powerful Features for Modern Property Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <f.icon className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
