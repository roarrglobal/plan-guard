import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionProductPage() {
  return (
    <SolutionTeamPage
      title="Build features people actually use"
      subtitle="Snag helps product teams stress-test roadmap decisions before committing engineering resources."
      stats={[
        { value: "60-95%", label: "of features never get adopted" },
        { value: "$2.5M", label: "average cost of a failed feature initiative" },
        { value: "6 months", label: "average time wasted on wrong priorities" },
      ]}
      templateName="Feature Prioritization Template"
      templateDesc="Validate every roadmap bet before writing a line of code"
      blindSpots={[
        { title: "Adoption Assumptions", desc: "Will users actually use this, or is it an internal fantasy?" },
        { title: "Engineering Complexity", desc: "Is the estimate realistic, or are there hidden dependencies?" },
        { title: "Competitive Timing", desc: "Will this still matter when it ships in 6 months?" },
        { title: "Maintenance Burden", desc: "Who supports this after launch, and at what cost?" },
        { title: "Scope Creep Risk", desc: "Can this be built in the proposed timeline without ballooning?" },
        { title: "Cannibalization", desc: "Does this new feature undermine an existing revenue stream?" },
      ]}
      useCases={[
        { title: "Feature Prioritization", desc: "Should we build this feature next?" },
        { title: "Build vs. Buy", desc: "Is it faster and cheaper to buy a solution?" },
        { title: "Roadmap Planning", desc: "Are we investing in the right bets this quarter?" },
        { title: "Deprecation Decisions", desc: "Should we sunset this feature?" },
      ]}
      roiTagline="One avoided failed feature saves a quarter of engineering time."
      roiExample={[
        { metric: "Avg failed feature cost", value: "$2.5M" },
        { metric: "Bad bets avoided/year", value: "1-2" },
        { metric: "Engineering time saved", value: "3-6 mo" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
