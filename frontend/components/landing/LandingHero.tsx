export default function LandingHero() {
  return (
    <section className="bg-blue-900 text-white px-8 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Get More Done with Whitepace
      </h1>
      <p className="text-lg max-w-2xl mx-auto mb-8">
        Project management software that enables your teams to collaborate,
        plan, and manage everyday tasks.
      </p>
      <div className="flex justify-center space-x-4">
        <a
          href="#features"
          className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300"
        >
          Try Whitepace Free
        </a>
        <a
          href="#pricing"
          className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900"
        >
          View Plans
        </a>
      </div>
    </section>
  );
}
