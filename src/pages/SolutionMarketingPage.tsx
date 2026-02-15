import SolutionTeamPage from "@/components/marketing/SolutionTeamPage";

export default function SolutionMarketingPage() {
  return (
    <SolutionTeamPage
      title="Launch campaigns that land"
      subtitle="Snag helps marketing teams stress-test campaigns before committing budget and reputation."
      stats={[
        { value: "9%", label: "of marketers report accurate attribution" },
        { value: "26%", label: "of marketing budget is wasted on ineffective channels" },
        { value: "$14K", label: "average cost of a failed campaign launch" },
      ]}
      templateName="Campaign Launch Template"
      templateDesc="Pre-mortem analysis for every major campaign and channel decision"
      blindSpots={[
        { title: "Attribution", desc: "Can you actually measure what this campaign delivers?" },
        { title: "Audience Assumptions", desc: "Is your ICP based on data or internal consensus?" },
        { title: "Competitive Timing", desc: "Is a competitor about to launch something that overshadows you?" },
        { title: "Creative Fatigue", desc: "Are you reusing assets that have already peaked?" },
        { title: "Channel Saturation", desc: "Are you doubling down on channels with diminishing returns?" },
        { title: "Internal Alignment", desc: "Does sales actually agree with this messaging?" },
      ]}
      useCases={[
        { title: "Campaign Launches", desc: "Should we launch this campaign now?" },
        { title: "Channel Decisions", desc: "Should we invest in this new channel?" },
        { title: "Brand Positioning", desc: "Is this rebrand the right move?" },
        { title: "Event Strategy", desc: "Is this conference worth sponsoring?" },
      ]}
      roiTagline="One avoided wasted campaign pays for Snag many times over."
      roiExample={[
        { metric: "Avg wasted campaign cost", value: "$14K" },
        { metric: "Bad campaigns avoided/year", value: "3-5" },
        { metric: "Annual savings", value: "$42K+" },
        { metric: "Snag cost (Team/year)", value: "$708" },
      ]}
    />
  );
}
