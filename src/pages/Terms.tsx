import { LegalPageLayout, type LegalSection } from "@/components/marketing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: <p>By accessing or using Snag ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the Terms, you may not access the Service.</p>,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: (
      <>
        <p>Snag is a decision intelligence platform that provides:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>AI-powered pre-mortem analysis</li>
          <li>Decision tracking and journaling</li>
          <li>Outcome tracking and pattern recognition</li>
          <li>Team collaboration features</li>
        </ul>
      </>
    ),
  },
  {
    id: "registration",
    title: "3. Account Registration",
    content: (
      <>
        <p>To use the Service, you must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Be at least 16 years of age</li>
          <li>Have one account per person (no shared accounts)</li>
        </ul>
        <p>You are responsible for all activity under your account.</p>
      </>
    ),
  },
  {
    id: "payment",
    title: "4. Subscription and Payment",
    content: (
      <>
        <p className="font-semibold">4.1 Free Tier</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>Limited features as described on our pricing page</li>
          <li>No payment required</li>
          <li>May be modified or discontinued</li>
        </ul>
        <p className="font-semibold">4.2 Paid Plans</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>Billed monthly or annually as selected</li>
          <li>Prices are in USD unless otherwise stated</li>
          <li>Payment processed via secure third-party provider</li>
          <li>Auto-renewal unless canceled</li>
        </ul>
        <p className="font-semibold">4.3 Price Changes</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We may change prices with 30 days notice</li>
          <li>Price changes apply to next billing cycle</li>
        </ul>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "5. Cancellation and Refunds",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>You may cancel your subscription at any time</li>
        <li>Access continues until end of current billing period</li>
        <li>30-day money-back guarantee on first payment (see <a href="/refund" className="text-primary hover:underline">/refund</a>)</li>
        <li>No partial refunds for mid-cycle cancellations after 30 days</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use",
    content: (
      <>
        <p>You agree NOT to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use the Service for any illegal purpose</li>
          <li>Upload malicious content or malware</li>
          <li>Attempt to breach or test our security</li>
          <li>Resell or redistribute the Service</li>
          <li>Use automated systems without permission</li>
          <li>Harass, abuse, or harm others</li>
          <li>Impersonate any person or entity</li>
          <li>Interfere with the Service's operation</li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    title: "7. Intellectual Property",
    content: (
      <>
        <p className="font-semibold">7.1 Our Property</p>
        <ul className="list-disc pl-6 space-y-1 mb-3">
          <li>Snag owns all platform IP (code, design, trademarks)</li>
          <li>The SNAG Framework™ is our proprietary methodology</li>
          <li>You may not copy, modify, or distribute our IP</li>
        </ul>
        <p className="font-semibold">7.2 Your Content</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You retain ownership of your content (decisions, analyses, journals)</li>
          <li>You grant us license to process your content to provide the Service</li>
          <li>You may export your content at any time</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-content",
    title: "8. AI-Generated Content",
    content: (
      <>
        <p className="font-semibold">Important disclaimers:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analyses are AI-generated suggestions, not professional advice</li>
          <li>You are solely responsible for decisions you make</li>
          <li>We do not guarantee accuracy of predictions</li>
          <li>Always apply professional judgment</li>
          <li>For legal, financial, or medical decisions, consult appropriate professionals</li>
        </ul>
      </>
    ),
  },
  {
    id: "teams",
    title: "9. Team Accounts",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>The account owner is responsible for team member conduct</li>
        <li>Team visibility settings determine who can see what</li>
        <li>Removing a member revokes their access immediately</li>
        <li>Team data belongs to the team, not individual members</li>
      </ul>
    ),
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    content: (
      <>
        <p className="font-semibold uppercase">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
        <p className="font-semibold">WE ARE NOT LIABLE FOR:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Decisions made based on our analyses</li>
          <li>Business losses or damages</li>
          <li>Service interruptions or data loss</li>
          <li>Third-party actions</li>
        </ul>
        <p className="font-semibold">MAXIMUM LIABILITY: Limited to fees paid in the prior 12 months.</p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    content: (
      <>
        <p>You agree to indemnify Snag against claims arising from:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your content</li>
          <li>Your violation of any third-party rights</li>
        </ul>
      </>
    ),
  },
  {
    id: "termination",
    title: "12. Termination",
    content: (
      <>
        <p>We may terminate or suspend accounts that:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Violate these Terms</li>
          <li>Engage in fraudulent activity</li>
          <li>Fail to pay for subscribed services</li>
          <li>Are inactive for extended periods (with notice)</li>
        </ul>
        <p>You may terminate by canceling your subscription and deleting your account.</p>
      </>
    ),
  },
  {
    id: "disputes",
    title: "13. Dispute Resolution",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>Disputes will be resolved through binding arbitration</li>
        <li>Class action waiver applies</li>
        <li>Small claims court remains available</li>
      </ul>
    ),
  },
  {
    id: "governing-law",
    title: "14. Governing Law",
    content: <p>These Terms are governed by applicable laws, without regard to conflict of law provisions.</p>,
  },
  {
    id: "changes",
    title: "15. Changes to Terms",
    content: <p>We may modify these Terms at any time. Material changes will be communicated via email. Continued use constitutes acceptance.</p>,
  },
  {
    id: "contact",
    title: "16. Contact",
    content: (
      <p>For legal questions: <a href="mailto:hello@snagme.app" className="text-primary hover:underline">hello@snagme.app</a></p>
    ),
  },
];

export default function Terms() {
  return <LegalPageLayout title="Terms of Service" lastUpdated="February 2026" sections={sections} />;
}
