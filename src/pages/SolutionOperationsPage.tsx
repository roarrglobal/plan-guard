import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionOperationsPage() {
  return (
    <SolutionTeamPage
      title="Implement changes that work"
      subtitle="Snag helps operations teams identify implementation risks before committing to process changes and automation."
      stats={[
        { value: "70%", label: "of change initiatives fail" },
        { value: "50%", label: "of automation projects don't deliver expected ROI" },
        { value: "$1.3M", label: "average cost of a failed process change" },
      ]}
      templateName="Process Automation Template"
      templateDesc="Structured risk analysis for every operational change"
      blindSpots={[
        { title: "Exception Handling", desc: "What happens when the process hits an edge case?" },
        { title: "Training Requirements", desc: "How long until the team is actually productive with the new process?" },
        { title: "Integration Complexity", desc: "How many systems does this touch, and which ones will break?" },
        { title: "Rollback Capability", desc: "If this fails, can you go back to the old way?" },
        { title: "Change Resistance", desc: "Will the team actually adopt this, or work around it?" },
        { title: "Vendor Dependency", desc: "Are you creating a single point of failure with this tool?" },
      ]}
      useCases={[
        { title: "Process Changes", desc: "Should we implement this new workflow?" },
        { title: "Automation Decisions", desc: "Is this process ready to automate?" },
        { title: "Vendor Selection", desc: "Which operations tool fits best?" },
        { title: "Scaling Decisions", desc: "Are we ready to scale this operation?" },
      ]}
      roiTagline="One avoided failed change initiative saves millions."
      roiExample={[
        { metric: "Avg failed initiative cost", value: "$1.3M" },
        { metric: "Failed changes avoided/year", value: "1" },
        { metric: "Annual savings", value: "$1.3M+" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
