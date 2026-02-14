import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";

const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(160, 84%, 39%)",
  "hsl(var(--accent-foreground))",
  "hsl(45, 93%, 47%)",
  "hsl(280, 65%, 60%)",
  "hsl(200, 70%, 50%)",
  "hsl(var(--muted-foreground))",
];

const OUTCOME_COLORS: Record<string, string> = {
  right_call: "hsl(160, 84%, 39%)",
  mostly_right: "hsl(160, 60%, 55%)",
  mixed: "hsl(45, 93%, 47%)",
  mostly_wrong: "hsl(0, 60%, 55%)",
  wrong_call: "hsl(var(--destructive))",
  too_early: "hsl(var(--muted-foreground))",
};

const OUTCOME_LABELS: Record<string, string> = {
  right_call: "Right Call",
  mostly_right: "Mostly Right",
  mixed: "Mixed",
  mostly_wrong: "Mostly Wrong",
  wrong_call: "Wrong Call",
  too_early: "Too Early",
};

const STAKES_COLORS: Record<string, string> = {
  low: "hsl(var(--muted-foreground))",
  medium: "hsl(var(--primary))",
  high: "hsl(45, 93%, 47%)",
  critical: "hsl(var(--destructive))",
};

interface Props {
  decisions: any[];
  outcomes: any[];
}

export function AnalyticsCharts({ decisions, outcomes }: Props) {
  // Category breakdown
  const categoryMap: Record<string, number> = {};
  decisions.forEach((d) => { const c = d.category || "other"; categoryMap[c] = (categoryMap[c] || 0) + 1; });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    .sort((a, b) => b.value - a.value);

  // Stakes breakdown
  const stakesMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  decisions.forEach((d) => { const s = d.stakes || "medium"; stakesMap[s] = (stakesMap[s] || 0) + 1; });
  const stakesData = Object.entries(stakesMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  // Outcome distribution
  const outcomeMap: Record<string, number> = {};
  outcomes.forEach((o) => { outcomeMap[o.result] = (outcomeMap[o.result] || 0) + 1; });
  const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({
    name: OUTCOME_LABELS[name] || name, value, key: name,
  }));

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Category Pie */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">By Category</CardTitle></CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No data</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {categoryData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stakes Bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">By Stakes</CardTitle></CardHeader>
        <CardContent>
          {stakesData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stakesData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stakesData.map((s) => <Cell key={s.name} fill={STAKES_COLORS[s.name] || "hsl(var(--primary))"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Outcomes Pie */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Outcomes Distribution</CardTitle></CardHeader>
        <CardContent>
          {outcomeData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No outcomes logged yet</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                    {outcomeData.map((d) => <Cell key={d.key} fill={OUTCOME_COLORS[d.key] || "hsl(var(--muted-foreground))"} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {outcomeData.map((d) => (
                  <span key={d.key} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: OUTCOME_COLORS[d.key] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
