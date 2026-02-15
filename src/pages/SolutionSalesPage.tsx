import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionSalesPage() {
  return (
    <SolutionTeamPage
      title="Stop pursuing deals that won't close"
      subtitle="Snag helps sales teams identify deal risks before wasting months on the wrong opportunities."
      stats={[
        { value: "40%", label: "of forecasted deals end in 'no decision'" },
        { value: "50%", label: "of sales time spent on deals that won't close" },
        { value: "$50K", label: "average cost of pursuing a single bad deal" },
      ]}
      templateName="Sales Deal Pursuit Template"
      templateDesc="Built from analyzing thousands of won and lost deals"
      blindSpots={[
        { title: "Champion Dependency", desc: "Is your champion actually a champion?" },
        { title: "Budget Assumption", desc: "Is budget approved, allocated, or imaginary?" },
        { title: "Competitive Landscape", desc: "Who else is in the deal you don't know about?" },
        { title: "Timeline Reality", desc: "Is their urgency real or polite interest?" },
        { title: "Technical Fit", desc: "Will your solution actually work in their environment?" },
        { title: "Decision-Maker Access", desc: "Are you talking to someone who can say yes?" },
        { title: "Procurement Surprise", desc: "What happens when legal and procurement get involved?" },
      ]}
      useCases={[
        { title: "Deal Qualification", desc: "Should we pursue this opportunity?" },
        { title: "Pricing Strategy", desc: "Can we hold our price or will we discount?" },
        { title: "Competitive Positioning", desc: "How do we beat the competition?" },
        { title: "Account Planning", desc: "Where should we focus next quarter?" },
      ]}
      roiTagline="One avoided bad deal pays for a year of Snag."
      roiExample={[
        { metric: "Avg deal pursuit cost", value: "$50K" },
        { metric: "Bad deals avoided/quarter", value: "2-3" },
        { metric: "Annual savings", value: "$100K+" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
