import { LegalPageLayout, type LegalSection } from "@/components/marketing/LegalPageLayout";
import { Link } from "react-router-dom";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p>Snag ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decision intelligence platform at snagme.app.</p>
        <p>Snag is operated by Roarr Consulting Group.</p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    content: (
      <>
        <p className="font-semibold">2.1 Information You Provide</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account information (name, email address, password)</li>
          <li>Profile information (company name, role)</li>
          <li>Team information (team name, member emails)</li>
          <li>Decision content (titles, descriptions, categories, stakes)</li>
          <li>Analysis outputs and outcomes</li>
          <li>Journal entries and habits data</li>
          <li>Communications with us</li>
        </ul>
        <p className="font-semibold">2.2 Information Collected Automatically</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Log data (IP address, browser type, device information)</li>
          <li>Usage data (features used, actions taken, timestamps)</li>
          <li>Cookies and similar technologies</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide and maintain our service</li>
          <li>Process your decisions and generate AI analyses</li>
          <li>Track outcomes and generate insights</li>
          <li>Send notifications and updates</li>
          <li>Improve our service and develop new features</li>
          <li>Respond to support requests</li>
          <li>Ensure security and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "4. How We Share Your Information",
    content: (
      <>
        <p className="font-semibold">We do not sell your personal information.</p>
        <p>We may share information with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Service providers (hosting, email delivery, analytics)</li>
          <li>Legal authorities (when required by law)</li>
          <li>Business transfers (in case of merger or acquisition)</li>
        </ul>
        <p><strong>Within teams:</strong> Team members can see shared decisions based on visibility settings you choose.</p>
      </>
    ),
  },
  {
    id: "ai-and-data",
    title: "5. AI and Your Data",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Your decision content is processed by AI to generate analyses</li>
        <li>Your personal data is NOT used to train AI models</li>
        <li>Analyses are generated in real-time and specific to your query</li>
        <li>You retain ownership of all your content</li>
      </ul>
    ),
  },
  {
    id: "data-retention",
    title: "6. Data Retention",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Active accounts: Data retained while your account is active</li>
        <li>Deleted accounts: Data permanently deleted within 30 days</li>
        <li>Audit logs: Retained for 1 year (Teams/Business)</li>
        <li>You can export your data at any time</li>
        <li>You can request deletion at any time</li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "7. Data Security",
    content: (
      <>
        <p>We implement appropriate security measures:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
          <li>Access controls and authentication</li>
          <li>Regular security assessments</li>
          <li>Secure cloud infrastructure</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "8. Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your data</li>
          <li>Export your data in portable format</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent where applicable</li>
        </ul>
        <p>To exercise these rights, email <a href="mailto:privacy@snagme.app" className="text-primary hover:underline">privacy@snagme.app</a>.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "9. Cookies",
    content: (
      <>
        <p>We use:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Essential cookies:</strong> Required for the service to function</li>
          <li><strong>Analytics cookies:</strong> Help us understand usage (optional)</li>
        </ul>
        <p>You can control cookies through your browser settings.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: <p>Snag is not intended for users under 16. We do not knowingly collect data from children.</p>,
  },
  {
    id: "international",
    title: "11. International Transfers",
    content: <p>Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards for all transfers.</p>,
  },
  {
    id: "changes",
    title: "12. Changes to This Policy",
    content: <p>We may update this policy from time to time. We will notify you of material changes via email or in-app notification.</p>,
  },
  {
    id: "contact",
    title: "13. Contact Us",
    content: (
      <>
        <p>For privacy questions:</p>
        <ul className="list-none space-y-1">
          <li>Email: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></li>
          <li>Snag is a remote-first company.</li>
        </ul>
        <p>For EU residents, see our <Link to="/gdpr" className="text-primary hover:underline">GDPR page</Link>.</p>
      </>
    ),
  },
];

export default function Privacy() {
  return <LegalPageLayout title="Privacy Policy" lastUpdated="February 2026" sections={sections} />;
}
