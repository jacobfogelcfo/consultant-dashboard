import { cn } from "@/lib/utils";
import { fmt, pctOf } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ClientCard({ client, mode, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const budget = mode === 'M' ? client.monthlyBudget : client.yearlyBudget;
  const spent = mode === 'M' ? Math.round(budget * 0.71) : Math.round(budget * 0.48);
  const pct = pctOf(spent, budget);
  const isOver = spent > budget;

  // Fake category breakdown
  const categories = [
    { name: 'Travel', spent: Math.round(spent * 0.28), color: '#6366f1' },
    { name: 'Subcontractors', spent: Math.round(spent * 0.40), color: '#8b5cf6' },
    { name: 'Design', spent: Math.round(spent * 0.20), color: '#ec4899' },
    { name: 'Meals', spent: Math.round(spent * 0.12), color: '#f59e0b' },
  ];

  return (
    <div className="group">
      <div
        className={cn(
          "panel-card p-3.5 cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-border/80 active:scale-[0.99]",
          expanded && "rounded-b-none border-b-0"
        )}
        onClick={() => onClick(client)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: client.color }}
            />
            <span className="text-sm font-semibold text-foreground truncate">{client.name}</span>
            {client.status === 'inactive' && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Inactive</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1 flex-shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Budget ({mode})</p>
            <p className="text-xs font-mono font-medium text-muted-foreground">{fmt.currency(budget, 'USD', true)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Spent</p>
            <p className={cn("text-xs font-mono font-semibold", isOver ? "text-negative" : "text-foreground")}>
              {fmt.currency(spent, 'USD', true)}
            </p>
          </div>
        </div>

        <MiniProgressBar value={spent} max={budget} color={client.color} />

        <div className="flex justify-between mt-1.5">
          <span className={cn("text-[10px] font-mono", isOver ? "text-negative" : "text-muted-foreground")}>
            {pct}% used
          </span>
          <span className="text-[10px] text-muted-foreground">
            {isOver ? `+${fmt.currency(spent - budget, 'USD', true)} over` : `${fmt.currency(budget - spent, 'USD', true)} left`}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="panel-card rounded-t-none border-t border-dashed border-border/60 p-3 animate-slide-up">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Spend by Category</p>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-foreground">{cat.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{fmt.currency(cat.spent, 'USD', true)}</span>
                </div>
                <MiniProgressBar value={cat.spent} max={spent} color={cat.color} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}