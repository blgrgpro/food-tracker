import { getMonthlyStats, getTotalStats, getCategoryStats } from "@/lib/actions";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { TrendingUp, TrendingDown, ShoppingBag, Euro, BarChart3 } from "lucide-react";
import { BudgetRing } from "@/components/budget-ring";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  "Produce":     "🥬",
  "Dairy":       "🥛",
  "Meat & Fish": "🥩",
  "Bakery":      "🍞",
  "Snacks":      "🍫",
  "Beverages":   "🧃",
  "Household":   "🧹",
  "Other":       "📦",
};

export default async function AnalyticsPage() {
  const [monthlyStats, totals, categoryStats] = await Promise.all([
    getMonthlyStats(),
    getTotalStats(),
    getCategoryStats(),
  ]);

  const maxSpent = monthlyStats.length > 0 ? Math.max(...monthlyStats.map((m) => m.total_spent)) : 0;

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;
  const prevDate = new Date(thisYear, thisMonth - 2);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;

  const thisMonthStat = monthlyStats.find((s) => s.year === thisYear && s.month === thisMonth);
  const lastMonthStat = monthlyStats.find((s) => s.year === prevYear && s.month === prevMonth);

  const momDelta =
    thisMonthStat && lastMonthStat && lastMonthStat.total_spent > 0
      ? ((thisMonthStat.total_spent - lastMonthStat.total_spent) / lastMonthStat.total_spent) * 100
      : null;

  const currentMonthSpent = thisMonthStat?.total_spent ?? 0;
  const totalCategorySpend = categoryStats.reduce((s, c) => s + c.total, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold page-title">Analytics</h1>
        <p className="page-subtitle text-sm mt-1">Spending overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard icon={ShoppingBag} label="Total trips" value={totals.total_trips.toString()} />
        <SummaryCard icon={Euro} label="Total spent" value={formatCurrency(totals.total_spent)} />
        <SummaryCard icon={TrendingUp} label="Avg per trip" value={formatCurrency(totals.avg_trip_cost)} />
        <SummaryCard icon={BarChart3} label="Months tracked" value={monthlyStats.length.toString()} />
      </div>

      {/* Month-over-month delta */}
      {momDelta !== null && (
        <div className="glass-card rounded-2xl shadow-md p-4 mb-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              momDelta >= 0 ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {momDelta >= 0 ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {momDelta >= 0 ? "Up" : "Down"}{" "}
              <span className={momDelta >= 0 ? "text-red-600" : "text-green-600"}>
                {Math.abs(momDelta).toFixed(1)}%
              </span>{" "}
              vs last month
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(thisMonthStat?.total_spent ?? 0)} this month · {formatCurrency(lastMonthStat?.total_spent ?? 0)} last month
            </p>
          </div>
        </div>
      )}

      {/* Budget ring */}
      <div className="mb-4">
        <BudgetRing currentMonthSpent={currentMonthSpent} />
      </div>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div className="glass-card rounded-2xl shadow-md p-5 mb-4">
          <h2 className="text-base font-semibold mb-4">Spending by Category</h2>
          <div className="flex flex-col gap-3.5">
            {categoryStats.map((stat) => {
              const pct = totalCategorySpend > 0 ? (stat.total / totalCategorySpend) * 100 : 0;
              return (
                <div key={stat.category}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{CATEGORY_EMOJI[stat.category] ?? "🛒"}</span>
                      <span className="font-medium">{stat.category}</span>
                      <span className="text-xs text-muted-foreground">
                        ({stat.item_count} item{stat.item_count !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(stat.total)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="glass-card rounded-2xl shadow-md p-5">
        <h2 className="text-base font-semibold mb-4">Monthly Spending</h2>
        {monthlyStats.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">No data yet</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Complete a trip to see monthly stats</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {monthlyStats.map((stat) => {
              const barWidth = maxSpent > 0 ? (stat.total_spent / maxSpent) * 100 : 0;
              const isThisMonth = stat.year === thisYear && stat.month === thisMonth;
              const delta =
                isThisMonth && lastMonthStat && lastMonthStat.total_spent > 0
                  ? ((stat.total_spent - lastMonthStat.total_spent) / lastMonthStat.total_spent) * 100
                  : null;
              return (
                <div key={`${stat.year}-${stat.month}`} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMonth(stat.year, stat.month)}</span>
                      {delta !== null && (
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            delta >= 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {delta >= 0 ? "↑" : "↓"}{Math.abs(delta).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(stat.total_spent)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{stat.trip_count} trip{stat.trip_count !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>avg {formatCurrency(stat.avg_cost)}/trip</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    <div className="glass-card rounded-2xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
