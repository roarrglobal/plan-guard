import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentBadge } from "@/components/templates/DepartmentBadge";
import { DEPARTMENTS } from "@/lib/departments";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const DEPT_CHART_COLORS: Record<string, string> = {
  sales: "hsl(160, 84%, 39%)",
  finance: "hsl(217, 91%, 60%)",
  product: "hsl(258, 90%, 66%)",
  hr: "hsl(38, 92%, 50%)",
  marketing: "hsl(330, 81%, 60%)",
  operations: "hsl(220, 9%, 46%)",
  strategy: "hsl(349, 57%, 47%)",
};

interface Props {
  decisions: any[];
  outcomes: any[];
}

export function AnalyticsDepartments({ decisions, outcomes }: Props) {
  // Decisions by department
  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    decisions.forEach(d => {
      const dept = d.category || "other";
      if (DEPARTMENTS.find(dd => dd.value === dept)) {
        map[dept] = (map[dept] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([dept, count]) => ({
        dept,
        label: DEPARTMENTS.find(d => d.value === dept)?.label || dept,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [decisions]);

  // Accuracy by department
  const accuracyData = useMemo(() => {
    const deptOutcomes: Record<string, { total: number; good: number }> = {};
    outcomes.forEach(o => {
      const decision = decisions.find(d => d.id === o.decision_id);
      if (!decision) return;
      const dept = decision.category || "other";
      if (!deptOutcomes[dept]) deptOutcomes[dept] = { total: 0, good: 0 };
      deptOutcomes[dept].total++;
      if (["right_call", "mostly_right"].includes(o.result)) deptOutcomes[dept].good++;
    });
    return Object.entries(deptOutcomes)
      .map(([dept, data]) => ({
        dept,
        label: DEPARTMENTS.find(d => d.value === dept)?.label || dept,
        accuracy: Math.round((data.good / data.total) * 100),
        total: data.total,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [decisions, outcomes]);

  // Most common blind spots by department
  const topBlindSpots = useMemo(() => {
    const spots: Record<string, Record<string, number>> = {};
    outcomes.forEach(o => {
      const decision = decisions.find(d => d.id === o.decision_id);
      if (!decision) return;
      const dept = decision.category || "other";
      (o.predictions_hit || []).forEach((p: string) => {
        if (!spots[dept]) spots[dept] = {};
        spots[dept][p] = (spots[dept][p] || 0) + 1;
      });
      (o.predictions_missed || []).forEach((p: string) => {
        if (!spots[dept]) spots[dept] = {};
        spots[dept][p] = (spots[dept][p] || 0) + 1;
      });
    });
    return spots;
  }, [decisions, outcomes]);

  if (deptData.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Department Breakdown</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Decisions by department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Decisions by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(150, deptData.length * 36)}>
              <BarChart data={deptData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {deptData.map(d => (
                    <Cell key={d.dept} fill={DEPT_CHART_COLORS[d.dept] || "hsl(var(--muted-foreground))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accuracy by department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Accuracy by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {accuracyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Log outcomes to see accuracy</p>
            ) : (
              <div className="space-y-3">
                {accuracyData.map(d => (
                  <div key={d.dept} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <DepartmentBadge department={d.dept} size="sm" />
                      <span className="text-sm font-medium text-foreground">{d.accuracy}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${d.accuracy}%`,
                          backgroundColor: DEPT_CHART_COLORS[d.dept] || "hsl(var(--primary))",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{d.total} outcomes</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
