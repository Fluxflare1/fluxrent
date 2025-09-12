// frontend/app/tenant/page.tsx
export default function TenantDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1>
      <p className="text-slate-600 mb-6">
        Welcome, Tenant. Here you can view your rent balance, see payment history,
        and submit maintenance requests.
      </p>

      {/* Example tenant quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
          <p className="text-2xl font-bold text-red-600">$450 Due</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Next Due Date</h3>
          <p className="text-2xl font-bold text-slate-700">Sept 30, 2025</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Last Payment</h3>
          <p className="text-2xl font-bold text-green-600">$600 on Aug 30</p>
        </div>
      </div>

      {/* Maintenance section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
        <div className="card">
          <p className="text-slate-600 mb-3">
            You don’t have any open maintenance requests.
          </p>
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg">
            New Request
          </button>
        </div>
      </div>
    </div>
  );
}
