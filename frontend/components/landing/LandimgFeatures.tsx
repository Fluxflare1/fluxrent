import { Home, DollarSign, MessageSquare } from "lucide-react";

export default function LandingFeatures() {
  return (
    <section id="features" className="px-8 py-20 bg-white text-center">
      <h2 className="text-3xl font-bold mb-12">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <Home className="w-12 h-12 text-blue-900 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Property Management</h3>
          <p className="text-gray-600">
            Keep track of properties, units, and leases in one central hub.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <DollarSign className="w-12 h-12 text-blue-900 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Rent & Payments</h3>
          <p className="text-gray-600">
            Automate rent collection, track payments, and manage overdue balances.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <MessageSquare className="w-12 h-12 text-blue-900 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Tenant Communication</h3>
          <p className="text-gray-600">
            Enable seamless messaging between property managers and tenants.
          </p>
        </div>
      </div>
    </section>
  );
}
