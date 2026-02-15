import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionHRPage() {
  return (
    <SolutionTeamPage
      title="Make hiring decisions that stick"
      subtitle="Snag helps HR teams identify hidden risks in hiring, promotion, and organizational decisions."
      stats={[
        { value: "$240K", label: "average cost of a bad hire" },
        { value: "46%", label: "of new hires fail within 18 months" },
        { value: "3-6 mo", label: "average time to replace a bad hire" },
      ]}
      templateName="Hiring Decision Template"
      templateDesc="Structured evaluation that goes beyond gut instinct"
      blindSpots={[
        { title: "Culture Fit Bias", desc: "Are you hiring someone who fits or someone who challenges?" },
        { title: "Reference Validity", desc: "Are references telling you what you want to hear?" },
        { title: "Urgency Bias", desc: "Are you hiring fast because you need to, or because you're tired of looking?" },
        { title: "Team Dynamics", desc: "How will this person actually interact with the existing team?" },
        { title: "Growth Trajectory", desc: "Are you hiring for today's needs or tomorrow's?" },
        { title: "Compensation Anchoring", desc: "Is the salary competitive, or are you anchored to internal bands?" },
      ]}
      useCases={[
        { title: "Hiring Decisions", desc: "Should we extend an offer to this candidate?" },
        { title: "Promotion Decisions", desc: "Is this person ready for the next level?" },
        { title: "Org Restructuring", desc: "Will this reorganization achieve its goals?" },
        { title: "Compensation Reviews", desc: "Are we paying competitively in this market?" },
      ]}
      roiTagline="One avoided bad hire saves a quarter-million dollars."
      roiExample={[
        { metric: "Avg cost of bad hire", value: "$240K" },
        { metric: "Bad hires avoided/year", value: "1-2" },
        { metric: "Annual savings", value: "$240K+" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
