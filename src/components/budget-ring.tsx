"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface BudgetRingProps {
  currentMonthSpent: number;
}

export function BudgetRing({ currentMonthSpent }: BudgetRingProps) {
  const [budget, setBudget] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("monthly_budget");
    if (saved) setBudget(parseFloat(saved));
  }, []);

  function saveBudget() {
    const val = parseFloat(input);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem("monthly_budget", String(val));
    }
    setEditing(false);
    setInput("");
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = budget ? Math.min(currentMonthSpent / budget, 1) : 0;
  const dashOffset = circumference * (1 - progress);
  const isOver = budget !== null && currentMonthSpent > budget;
  const pct = budget ? Math.round((currentMonthSpent / budget) * 100) : 0;

  if (editing) {
    return (
      <div className="glass-card rounded-2xl shadow-md p-5">
        <p className="text-sm font-semibold mb-3">Set monthly budget (€)</p>
        <div className="flex gap-2">
          <input
            type="number"
            step="10"
            min="0"
            placeholder="e.g. 400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveBudget();
              if (e.key === "Escape") { setEditing(false); setInput(""); }
            }}
            autoFocus
            className="flex-1 h-10 rounded-xl border border-border bg-white/70 px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={saveBudget}
            className="h-10 px-3 rounded-xl bg-primary text-primary-foreground flex items-center gap-1 text-sm font-medium"
          >
            <Check className="h-4 w-4" /> Save
          </button>
          <button
            onClick={() => { setEditing(false); setInput(""); }}
            className="h-10 px-3 rounded-xl border border-border text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="glass-card rounded-2xl shadow-md p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
          <span className="text-muted-foreground/40 text-xl font-light">€</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">No budget set</p>
          <p className="text-xs text-muted-foreground mt-0.5">Track spending against a monthly target</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-primary font-semibold px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
        >
          Set budget
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Monthly Budget</h2>
        <button
          onClick={() => { setInput(String(budget)); setEditing(true); }}
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Edit budget"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r={radius}
              fill="none" stroke="currentColor" strokeWidth="10"
              className="text-muted/60"
            />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 0.7s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold leading-none ${isOver ? "text-destructive" : ""}`}>
              {pct}%
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">used</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div>
            <p className="text-xs text-muted-foreground">Spent this month</p>
            <p className={`text-xl font-bold ${isOver ? "text-destructive" : "text-primary"}`}>
              €{currentMonthSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly budget</p>
            <p className="text-lg font-semibold">€{budget.toFixed(2)}</p>
          </div>
          <p className={`text-xs font-medium ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
            {isOver
              ? `Over by €${(currentMonthSpent - budget).toFixed(2)}`
              : `€${(budget - currentMonthSpent).toFixed(2)} remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}
