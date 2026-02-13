import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <Link href="/landing" className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-block">&larr; Back to home</Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-neutral-400 mb-8">Last updated: February 2026</p>

      <div className="prose prose-neutral prose-sm max-w-none space-y-6 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using WallStreetAI (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Description of Service</h2>
          <p>WallStreetAI provides AI-powered portfolio analysis, risk assessment, and investment insights. The Service allows you to connect brokerage accounts (read-only) or manually enter holdings to receive personalized analysis.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Not Financial Advice</h2>
          <p><strong>The Service is for informational and educational purposes only.</strong> Nothing on WallStreetAI constitutes financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the content as such.</p>
          <p>AI-generated analysis, recommendations, and risk scores are automated outputs and may contain errors. Always consult a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Account Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must not use the Service for any unlawful purpose.</li>
            <li>You must be at least 18 years old to use the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Data & Privacy</h2>
          <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-neutral-900 underline">Privacy Policy</Link>. By using the Service, you consent to the collection and use of data as described therein.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Intellectual Property</h2>
          <p>All content, features, and functionality of the Service (including AI-generated analysis, design, code, and branding) are owned by WallStreetAI and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, WallStreetAI and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from your use of the Service.</p>
          <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. You may delete your account at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">9. Changes to Terms</h2>
          <p>We may modify these Terms at any time. If we make material changes, we will notify you via email or an in-app notice. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">10. Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@wallstreetai.io" className="text-neutral-900 underline">legal@wallstreetai.io</a>.</p>
        </section>
      </div>
    </div>
  );
}
