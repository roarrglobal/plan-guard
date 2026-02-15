import { LegalPageLayout, type LegalSection } from "@/components/marketing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "For Users in the EEA",
    content: <p>Snag is committed to GDPR compliance. This page supplements our Privacy Policy with information specific to EEA residents.</p>,
  },
  {
    id: "controller",
    title: "Data Controller",
    content: (
      <>
        <p>Snag (operated by Roarr Consulting Group)</p>
        <p>Email: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "Legal Basis for Processing",
    content: (
      <>
        <p className="font-semibold">Contract Performance</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>To provide the service you signed up for</li>
          <li>To process your decisions and generate analyses</li>
        </ul>
        <p className="font-semibold">Legitimate Interest</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>To improve our service</li>
          <li>To prevent fraud and ensure security</li>
          <li>To send transactional communications</li>
        </ul>
        <p className="font-semibold">Consent</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>For optional marketing communications</li>
          <li>For optional analytics cookies</li>
        </ul>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your Rights Under GDPR",
    content: (
      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>Right to Access</strong> — Request a copy of all personal data we hold about you.</li>
        <li><strong>Right to Rectification</strong> — Correct any inaccurate personal data.</li>
        <li><strong>Right to Erasure</strong> ("Right to be Forgotten") — Request deletion of your personal data.</li>
        <li><strong>Right to Restriction</strong> — Request limited processing of your data.</li>
        <li><strong>Right to Data Portability</strong> — Receive your data in a machine-readable format.</li>
        <li><strong>Right to Object</strong> — Object to processing based on legitimate interest.</li>
        <li><strong>Right to Withdraw Consent</strong> — Withdraw consent for marketing at any time.</li>
      </ol>
    ),
  },
  {
    id: "exercising",
    title: "Exercising Your Rights",
    content: (
      <>
        <p>Email <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a> with your request.</p>
        <p>We will respond within 30 days.</p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Data Transfers",
    content: (
      <>
        <p>Your data may be transferred outside the EEA. We ensure appropriate safeguards through:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Standard Contractual Clauses (SCCs)</li>
          <li>Data processing agreements with all vendors</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Account data: Retained while account is active</li>
        <li>Deleted accounts: Data deleted within 30 days</li>
        <li>Audit logs: 1 year retention</li>
      </ul>
    ),
  },
  {
    id: "dpo",
    title: "Data Protection Officer",
    content: (
      <p>For GDPR-specific inquiries: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
    ),
  },
  {
    id: "supervisory",
    title: "Supervisory Authority",
    content: <p>You have the right to lodge a complaint with your local data protection authority.</p>,
  },
  {
    id: "dpa",
    title: "Data Processing Agreement",
    content: (
      <p>Enterprise customers can request a DPA. Contact: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
    ),
  },
];

export default function GDPRPage() {
  return <LegalPageLayout title="GDPR Compliance" lastUpdated="February 2026" sections={sections} />;
}
