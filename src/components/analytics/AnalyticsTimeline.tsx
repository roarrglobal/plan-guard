import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface Props {
  decisions: any[];
  outcomes: any[];
}

export function AnalyticsTimeline({ decisions, outcomes }: Props) {
  // Last 6 months activity
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(new Date(), 5 - i);
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const created = decisions.filter((d) => {
      const dt = new Date(d.created_at);
      return isWithinInterval(dt, { start, end });
    }).length;
    const completed = outcomes.filter((o) => {
      const dt = new Date(o.created_at);
      return isWithinInterval(dt, { start, end });
    }).length;
    return { month: format(m, "MMM yy"), created, completed };
  });

  // Outcome quality over time
  const outcomeMonths = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(new Date(), 5 - i);
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const monthOutcomes = outcomes.filter((o) => isWithinInterval(new Date(o.created_at), { start, end }));
    const right = monthOutcomes.filter((o) => ["right_call", "mostly_right"].includes(o.result)).length;
    const mixed = monthOutcomes.filter((o) => o.result === "mixed").length;
    const wrong = monthOutcomes.filter((o) => ["mostly_wrong", "wrong_call"].includes(o.result)).length;
    return { month: format(m, "MMM yy"), right, mixed, wrong };
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Activity line chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Decision Activity (6 months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="created" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 3 }} name="Outcomes" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Outcome quality stacked bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Outcome Quality (6 months)</CardTitle></CardHeader>
        <CardContent>
          {outcomes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No outcomes yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={outcomeMonths}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="right" stackId="a" fill="hsl(160, 84%, 39%)" name="Right" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mixed" stackId="a" fill="hsl(45, 93%, 47%)" name="Mixed" />
                <Bar dataKey="wrong" stackId="a" fill="hsl(var(--destructive))" name="Wrong" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
