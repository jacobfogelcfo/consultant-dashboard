import { cn } from "@/lib/utils";
import { fmt, pctOf } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CLIENTS } from "@/data/seedData";

export function SpendCategoryCard({ category, mode }) {
  const [expanded, setExpanded] = useState(false);
  const budget = mode === 'M' ? category.monthlyBudget : category.yearlyBudget;
  const spent = mode === 'M' ? category.monthlySpent : category.yearlySpent;
  const pct = pctOf(spent, budget);
  const isOver = spent > budget;

  return (
    <div>
      <div
        className={cn(
          "panel-card p-3.5 cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-border/80",
          expanded && "rounded-b-none border-b-0"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: category.color }} />
            <span className="text-sm font-semibold text-foreground truncate">{category.name}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded",
              category.type === 'COGS' ? "bg-indigo-50 text-indigo-600" :
              category.type === 'OPEX' ? "bg-purple-50 text-purple-600" :
              "bg-teal-50 text-teal-600"
            )}>
              {category.type}
            </span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
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

        <MiniProgressBar value={spent} max={budget} color={category.color} />
        <div className="flex justify-between mt-1.5">
          <span className={cn("text-[10px] font-mono", isOver ? "text-negative" : "text-muted-foreground")}>{pct}% used</span>
          <span className="text-[10px] text-muted-foreground">
            {isOver ? `+${fmt.currency(spent - budget, 'USD', true)} over` : `${fmt.currency(budget - spent, 'USD', true)} left`}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="panel-card rounded-t-none border-t border-dashed border-border/60 p-3 animate-slide-up">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">By Client</p>
          <div className="space-y-1.5">
            {Object.entries(category.clientBreakdown).map(([clientId, amount]) => {
              const client = clientId === 'general'
                ? { name: 'General / No Client', color: '#94a3b8' }
                : CLIENTS.find(c => c.id === clientId);
              if (!client) return null;
              return (
                <div key={clientId} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: client.color }} />
                    <span className="text-xs text-foreground">{client.name}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{fmt.currency(amount, 'USD', true)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}