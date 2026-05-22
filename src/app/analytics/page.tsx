import { getMonthlyStats, getTotalStats } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { TrendingUp, ShoppingBag, DollarSign, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [monthlyStats, totals] = await Promise.all([getMonthlyStats(), getTotalStats()]);

  const maxSpent = monthlyStats.length > 0 ? Math.max(...monthlyStats.map((m) => m.total_spent)) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Spending overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard
          icon={ShoppingBag}
          label="Total trips"
          value={totals.total_trips.toString()}
        />
        <SummaryCard
          icon={DollarSign}
          label="Total spent"
          value={formatCurrency(totals.total_spent)}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Avg trip cost"
          value={formatCurrency(totals.avg_trip_cost)}
        />
        <SummaryCard
          icon={BarChart3}
          label="Months tracked"
          value={monthlyStats.length.toString()}
        />
      </div>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyStats.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
              <BarChart3 className="h-10 w-10 opacity-30" />
              <p className="text-sm">No data yet — complete a trip to see stats</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {monthlyStats.map((stat) => {
                const barWidth = maxSpent > 0 ? (stat.total_spent / maxSpent) * 100 : 0;
                return (
                  <div key={`${stat.year}-${stat.month}`} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{formatMonth(stat.year, stat.month)}</span>
                      <span className="font-semibold">{formatCurrency(stat.total_spent)}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{stat.trip_count} trips</span>
                      <span>·</span>
                      <span>avg {formatCurrency(stat.avg_cost)}/trip</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
