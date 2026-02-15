import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { AudienceSection } from "@/components/marketing/sections/AudienceSection";
import { ProblemSection } from "@/components/marketing/sections/ProblemSection";
import { HowItWorksSection } from "@/components/marketing/sections/HowItWorksSection";
import { LiveDemoSection } from "@/components/marketing/sections/LiveDemoSection";
import { UseCasesSection } from "@/components/marketing/sections/UseCasesSection";
import { ComparisonSection } from "@/components/marketing/sections/ComparisonSection";
import { FeaturesGridSection } from "@/components/marketing/sections/FeaturesGridSection";
import { SocialProofSection } from "@/components/marketing/sections/SocialProofSection";
import { PricingPreviewSection } from "@/components/marketing/sections/PricingPreviewSection";
import { FinalCtaSection } from "@/components/marketing/sections/FinalCtaSection";

export default function MarketingHome() {
  usePageSEO({ title: "Snag — Find the flaw before reality does", description: "Stress-test any plan in 2 minutes. Surface blind spots, failure modes, and warning signs with AI-powered pre-mortem analysis." });
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <HeroSection />
        <AudienceSection />
        <ProblemSection />
        <HowItWorksSection />
        <LiveDemoSection />
        <UseCasesSection />
        <ComparisonSection />
        <FeaturesGridSection />
        <SocialProofSection />
        <PricingPreviewSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
