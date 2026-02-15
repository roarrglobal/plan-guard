import { LegalPageLayout, type LegalSection } from "@/components/marketing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "guarantee",
    title: "30-Day Money-Back Guarantee",
    content: <p>We want you to be completely satisfied with Snag. If you're not happy with your purchase, we offer a simple refund policy.</p>,
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <>
        <p>You are eligible for a FULL refund if:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You request within 30 days of your FIRST payment</li>
          <li>You have not previously received a refund for Snag</li>
          <li>Your account is in good standing</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-to-request",
    title: "How to Request a Refund",
    content: (
      <ol className="list-decimal pl-6 space-y-1">
        <li>Email <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></li>
        <li>Subject line: "Refund Request"</li>
        <li>Include your account email</li>
        <li>We'll process within 5–7 business days</li>
        <li>Refund issued to original payment method</li>
      </ol>
    ),
  },
  {
    id: "after-refund",
    title: "What Happens After Refund",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Your subscription is canceled immediately</li>
        <li>You retain access until end of current period</li>
        <li>Your data is preserved for 30 days</li>
        <li>You can export data before deletion</li>
        <li>After 30 days, data is permanently deleted</li>
      </ul>
    ),
  },
  {
    id: "after-30-days",
    title: "After the 30-Day Period",
    content: (
      <>
        <p className="font-semibold">Monthly subscriptions:</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>No partial refunds available</li>
          <li>Cancel anytime, access continues until period ends</li>
        </ul>
        <p className="font-semibold">Annual subscriptions:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pro-rated refunds available upon request</li>
          <li>Email <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a> with your situation</li>
        </ul>
      </>
    ),
  },
  {
    id: "exceptions",
    title: "Exceptions",
    content: (
      <>
        <p>Refunds are NOT available for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Requests after 30 days from first payment</li>
          <li>Second or subsequent refund requests</li>
          <li>Enterprise contracts (separate terms apply)</li>
          <li>Accounts terminated for Terms of Service violations</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>Questions about refunds?</p>
        <ul className="list-none space-y-1">
          <li>Email: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></li>
          <li>Response within 24 hours</li>
        </ul>
      </>
    ),
  },
];

export default function RefundPage() {
  return <LegalPageLayout title="Refund Policy" lastUpdated="February 2026" sections={sections} />;
}
