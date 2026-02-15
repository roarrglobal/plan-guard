import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionFinancePage() {
  return (
    <SolutionTeamPage
      title="Approve budgets that deliver ROI"
      subtitle="Snag helps finance teams uncover hidden costs, challenge assumptions, and make budget decisions that stick."
      stats={[
        { value: "64%", label: "of ERP implementations go over budget" },
        { value: "30%", label: "of IT projects exceed budget by 50%+" },
        { value: "$1.5M", label: "average overspend on failed initiatives" },
      ]}
      templateName="Budget Approval Template"
      templateDesc="Structured analysis for every major financial commitment"
      blindSpots={[
        { title: "Hidden Costs", desc: "Integration, training, maintenance costs that don't appear in the proposal" },
        { title: "Opportunity Cost", desc: "What else could this budget accomplish?" },
        { title: "Sunk Cost Bias", desc: "Are you approving because you've already spent, or because it's right?" },
        { title: "Vendor Lock-in", desc: "What happens when you want to switch?" },
        { title: "ROI Assumptions", desc: "Are the projected returns based on realistic adoption rates?" },
        { title: "Timeline Optimism", desc: "Is the implementation timeline realistic given your org's track record?" },
      ]}
      useCases={[
        { title: "Budget Approvals", desc: "Should we fund this initiative?" },
        { title: "Vendor Selection", desc: "Which vendor offers the best risk-adjusted value?" },
        { title: "Investment Decisions", desc: "Is this capital expenditure justified?" },
        { title: "Cost Reduction", desc: "Will cutting this budget create hidden costs elsewhere?" },
      ]}
      roiTagline="One avoided budget overrun pays for a decade of Snag."
      roiExample={[
        { metric: "Avg budget overrun", value: "$500K" },
        { metric: "Overruns prevented/year", value: "1-2" },
        { metric: "Annual savings", value: "$500K+" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
