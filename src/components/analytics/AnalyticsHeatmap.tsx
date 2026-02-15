import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["9am", "12pm", "3pm", "6pm"];

interface Props {
  decisions: any[];
}

function getHeatLevel(count: number, max: number): number {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

export function AnalyticsHeatmap({ decisions }: Props) {
  const heatData = useMemo(() => {
    const grid: Record<string, number> = {};
    let max = 1;

    decisions.forEach((d) => {
      const dt = new Date(d.created_at);
      const dayIndex = dt.getDay() === 0 ? 6 : dt.getDay() - 1; // Mon=0, Sun=6
      const hour = dt.getHours();
      let hourBucket: number;
      if (hour < 12) hourBucket = 0;
      else if (hour < 15) hourBucket = 1;
      else if (hour < 18) hourBucket = 2;
      else hourBucket = 3;

      const key = `${dayIndex}-${hourBucket}`;
      grid[key] = (grid[key] || 0) + 1;
      max = Math.max(max, grid[key]);
    });

    return { grid, max };
  }, [decisions]);

  if (decisions.length < 5) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" /> Decision Heatmap
        </CardTitle>
        <p className="text-xs text-muted-foreground">When does your team make decisions?</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs text-muted-foreground w-12"></th>
                {DAYS.map((d) => (
                  <th key={d} className="text-xs text-muted-foreground text-center px-1 py-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hi) => (
                <tr key={hour}>
                  <td className="text-xs text-muted-foreground pr-2 py-1">{hour}</td>
                  {DAYS.map((_, di) => {
                    const count = heatData.grid[`${di}-${hi}`] || 0;
                    const level = getHeatLevel(count, heatData.max);
                    return (
                      <td key={di} className="p-1">
                        <div
                          className={`w-full aspect-square rounded-md heatmap-cell-${level} transition-colors`}
                          title={`${DAYS[di]} ${hour}: ${count} decisions`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div key={l} className={`w-3 h-3 rounded-sm heatmap-cell-${l}`} />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
