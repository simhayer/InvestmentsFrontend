import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <Link href="/landing" className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-block">&larr; Back to home</Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-neutral-400 mb-8">Last updated: February 2026</p>

      <div className="prose prose-neutral prose-sm max-w-none space-y-6 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Information We Collect</h2>
          <p>When you create an account, we collect your email address and a hashed password (managed by Supabase Auth). When you connect a brokerage through Plaid, we receive <strong>read-only</strong> access to your holdings and account balances. We never receive or store your brokerage login credentials.</p>
          <p>If you add holdings manually, we store the ticker symbols, quantities, and purchase prices you provide.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display your portfolio overview and performance metrics.</li>
            <li>Generate AI-powered analysis, risk scores, and recommendations personalized to your holdings.</li>
            <li>Improve the quality of our AI models and product experience (aggregated, non-identifiable data only).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Data Sharing</h2>
          <p>We do <strong>not</strong> sell, rent, or share your personal financial data with third parties for marketing purposes. We use the following third-party services to operate:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — Authentication and database hosting.</li>
            <li><strong>Plaid</strong> — Secure brokerage account linking (read-only).</li>
            <li><strong>Google Gemini / OpenAI</strong> — AI analysis generation. Portfolio data is sent to generate insights but is not stored by these providers beyond the request.</li>
            <li><strong>Stripe</strong> — Payment processing (if applicable).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Data Security</h2>
          <p>All data is encrypted in transit (TLS) and at rest (AES-256 via Supabase). Brokerage connections are read-only — we cannot move funds or execute trades on your behalf. API keys and secrets are stored securely and never exposed to the client.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Data Retention & Deletion</h2>
          <p>Your data is retained as long as your account is active. You can delete your account at any time by contacting us, which will permanently remove all your personal data, holdings, and analysis history from our systems.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Cookies</h2>
          <p>We use essential cookies only (authentication session tokens). We do not use tracking cookies or third-party advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Changes to This Policy</h2>
          <p>We may update this policy from time to time. If we make material changes, we will notify you via email or an in-app notice.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Contact</h2>
          <p>If you have questions about this privacy policy or your data, please contact us at <a href="mailto:privacy@wallstreetai.io" className="text-neutral-900 underline">privacy@wallstreetai.io</a>.</p>
        </section>
      </div>
    </div>
  );
}
