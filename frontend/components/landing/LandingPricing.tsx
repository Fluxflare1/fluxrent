export default function LandingPricing() {
  return (
    <section id="pricing" className="px-8 py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-10">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white border rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Personal</h3>
          <p className="text-4xl font-extrabold mb-6">$19<span className="text-lg">/mo</span></p>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>✔ 5 Projects</li>
            <li>✔ Unlimited Notes</li>
            <li>✔ Community Support</li>
          </ul>
          <a href="/login" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800">
            Get Started
          </a>
        </div>

        <div className="bg-blue-900 text-white border rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Organization</h3>
          <p className="text-4xl font-extrabold mb-6">$49<span className="text-lg">/mo</span></p>
          <ul className="mb-6 space-y-2">
            <li>✔ Unlimited Projects</li>
            <li>✔ Advanced Collaboration</li>
            <li>✔ Priority Support</li>
          </ul>
          <a href="/login" className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300">
            Start Now
          </a>
        </div>
      </div>
    </section>
  );
}
