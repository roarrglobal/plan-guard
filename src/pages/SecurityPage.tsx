import { LegalPageLayout, type LegalSection } from "@/components/marketing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: <p className="text-lg font-medium">Your decisions are sensitive. We take security seriously.</p>,
  },
  {
    id: "infrastructure",
    title: "Infrastructure Security",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Hosted on enterprise-grade cloud infrastructure</li>
        <li>Data encrypted at rest (AES-256)</li>
        <li>Data encrypted in transit (TLS 1.3)</li>
        <li>Regular security patches and updates</li>
        <li>DDoS protection</li>
        <li>Automated backups with encryption</li>
      </ul>
    ),
  },
  {
    id: "application",
    title: "Application Security",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Secure authentication with bcrypt password hashing</li>
        <li>Role-based access control</li>
        <li>Session management with secure tokens</li>
        <li>Input validation and sanitization</li>
        <li>Protection against OWASP Top 10 vulnerabilities</li>
        <li>Regular security testing</li>
      </ul>
    ),
  },
  {
    id: "organizational",
    title: "Organizational Security",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Background checks for team members with data access</li>
        <li>Security awareness training</li>
        <li>Principle of least privilege access</li>
        <li>Incident response procedures</li>
        <li>Vendor security assessment</li>
      </ul>
    ),
  },
  {
    id: "compliance",
    title: "Compliance",
    content: (
      <>
        <p className="font-semibold">Current:</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>GDPR compliant</li>
          <li>CCPA compliant</li>
        </ul>
        <p className="font-semibold">In Progress:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>SOC 2 Type II (targeting Q2 2026)</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-data",
    title: "Your Data",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Your decision data is NOT used to train AI models</li>
        <li>Data is isolated per user and per team</li>
        <li>Audit logs track all data access (Business tier)</li>
        <li>Data export available on request</li>
        <li>Data deletion within 30 days of request</li>
      </ul>
    ),
  },
  {
    id: "disclosure",
    title: "Responsible Disclosure",
    content: (
      <>
        <p>Found a security vulnerability? We appreciate responsible disclosure.</p>
        <p>Email: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
        <p className="font-semibold mt-3">We will:</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>Acknowledge receipt within 24 hours</li>
          <li>Keep you updated on our investigation</li>
          <li>Credit you (if desired) when resolved</li>
          <li>Not take legal action for good-faith reports</li>
        </ul>
        <p className="font-semibold">Please do NOT:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access data that isn't yours</li>
          <li>Disclose vulnerabilities publicly before resolution</li>
          <li>Use automated scanning without permission</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Questions?",
    content: (
      <p>Contact: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
    ),
  },
];

export default function SecurityPage() {
  return <LegalPageLayout title="Security" lastUpdated="February 2026" sections={sections} />;
}
