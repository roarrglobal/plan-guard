import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-cobalt">Snag</span>
            <div className="w-9" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-h1 mb-2">Privacy Policy</h1>
        <p className="text-small text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-h2 mb-4">1. Information We Collect</h2>
            <p className="text-body text-foreground font-semibold mb-2">a) Information you provide:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground mb-4">
              <li>Email address (for account creation)</li>
              <li>Plans and decisions you submit for analysis</li>
              <li>Payment information (processed by Razorpay; we do not store card details)</li>
            </ul>
            <p className="text-body text-foreground font-semibold mb-2">b) Information collected automatically:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Device type and browser</li>
              <li>IP address</li>
              <li>Usage data (analyses run, features used)</li>
              <li>Cookies for session management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">2. How We Use Your Information</h2>
            <p className="text-body text-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground mb-4">
              <li>Provide and improve the Service</li>
              <li>Process payments</li>
              <li>Send service-related communications</li>
              <li>Generate aggregated, anonymized statistics (e.g., "10,000 plans analyzed")</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-body text-foreground mb-2 font-semibold">We do NOT:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Sell your personal information</li>
              <li>Share your submitted plans with third parties</li>
              <li>Use your specific plans to train AI models</li>
              <li>Send marketing emails without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">3. Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Your data is stored securely with encryption at rest</li>
              <li>We use HTTPS for all data transmission</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
              <li>We retain your data for as long as your account is active</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">4. Third-Party Services</h2>
            <p className="text-body text-foreground mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Database and authentication services</li>
              <li>Razorpay (payment processing)</li>
              <li>AI services for analysis generation</li>
              <li>Analytics services</li>
            </ul>
            <p className="text-body text-foreground mt-4">
              These services have their own privacy policies governing their use of data.
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">5. Your Rights</h2>
            <p className="text-body text-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your analysis history</li>
              <li>Opt out of non-essential communications</li>
            </ul>
            <p className="text-body text-foreground mt-4">
              To exercise these rights, contact: privacy@roarrconsulting.com
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">6. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Active accounts: Data retained indefinitely</li>
              <li>Deleted accounts: Data permanently removed within 30 days</li>
              <li>Anonymous analyses (no account): Not stored beyond the session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">7. Cookies</h2>
            <p className="text-body text-foreground mb-4">We use essential cookies for:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Session management</li>
              <li>Authentication</li>
              <li>Usage tracking (anonymized)</li>
            </ul>
            <p className="text-body text-foreground mt-4">
              You can disable cookies in your browser, but some features may not work properly.
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">8. Children's Privacy</h2>
            <p className="text-body text-foreground">
              Snag is not intended for users under 18. We do not knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">9. International Users</h2>
            <p className="text-body text-foreground">
              Data is stored and processed in India. By using the Service, you consent to the transfer of data to India.
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">10. Changes to This Policy</h2>
            <p className="text-body text-foreground">
              We may update this Privacy Policy at any time. We will notify you of significant changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-h2 mb-4">11. Contact</h2>
            <p className="text-body text-foreground">
              For privacy-related questions:<br />
              Email: privacy@roarrconsulting.com
            </p>
            <p className="text-body text-muted-foreground mt-4">
              Roarr Consulting Group<br />
              Hyderabad, India
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-small text-[#666666]">
            © 2026 Roarr Consulting Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
