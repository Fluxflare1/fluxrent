// frontend/app/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Login or Request Access</h1>
        <p className="text-slate-600 mb-8">For the MVP, admins create property manager accounts. Property managers contact their platform admin to get started.</p>

        <div className="flex justify-center gap-4">
          <a href="mailto:admin@fluxrent.example?subject=Request%20Access" className="px-6 py-2 bg-yellow-400 text-blue-900 rounded font-semibold">
            Request Access
          </a>
          <a href="#" className="px-6 py-2 border rounded">Sign in (placeholder)</a>
        </div>
      </div>
    </div>
  );
}
