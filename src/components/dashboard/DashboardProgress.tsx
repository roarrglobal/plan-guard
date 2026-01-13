import { Progress } from "@/components/ui/progress";

interface DashboardProgressProps {
  totalAnalyses: number;
}

const MILESTONES = [5, 10, 25, 50, 100];

export function DashboardProgress({ totalAnalyses }: DashboardProgressProps) {
  // Find current and next milestone
  const currentMilestone = MILESTONES.filter((m) => totalAnalyses >= m).pop() || 0;
  const nextMilestone = MILESTONES.find((m) => totalAnalyses < m) || 100;
  
  // Calculate progress percentage
  const prevMilestone = MILESTONES[MILESTONES.indexOf(nextMilestone) - 1] || 0;
  const progressInRange = totalAnalyses - prevMilestone;
  const rangeSize = nextMilestone - prevMilestone;
  const progressPercent = Math.min((progressInRange / rangeSize) * 100, 100);

  if (totalAnalyses >= 100) {
    return (
      <div className="bg-gradient-to-r from-[#0047AB] to-[#7C3AED] rounded-xl p-4 mb-6 text-white">
        <p className="text-[14px] font-medium">🏆 Decision Master Achieved!</p>
        <p className="text-[13px] opacity-90 mt-1">
          You've stress-tested {totalAnalyses} decisions. You're in the top tier!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[14px] font-medium text-[#333333]">
          Decision Confidence Score
        </p>
        <span className="text-[12px] text-[#666666]">
          {totalAnalyses} / {nextMilestone}
        </span>
      </div>
      
      <Progress value={progressPercent} className="h-2 mb-2" />
      
      <p className="text-[12px] text-[#666666]">
        {nextMilestone - totalAnalyses} more to reach your next milestone
      </p>

      {/* Milestone markers */}
      <div className="flex justify-between mt-3">
        {MILESTONES.map((milestone) => (
          <div
            key={milestone}
            className={`text-[10px] font-medium ${
              totalAnalyses >= milestone ? "text-[#0047AB]" : "text-[#CCCCCC]"
            }`}
          >
            {milestone}
          </div>
        ))}
      </div>
    </div>
  );
}
