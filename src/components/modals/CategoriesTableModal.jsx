import { X } from "lucide-react";
import { SPEND_CATEGORIES_DATA } from "@/data/seedData";
import { fmt, pctOf } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function CategoriesTableModal({ onClose }) {
  const [mode, setMode] = useState('M');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Spend Categories — Table View</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {['M', 'Y'].map(m => (
                <button key={m} onClick={() => setMode(m)} className={cn(
                  "text-[11px] font-semibold px-2.5 py-0.5 rounded-md transition-all",
                  mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{m}</button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
              <tr>
                {['Category', 'Type', 'Budget', 'Spent', 'Remaining', '% Used', 'Trend'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {SPEND_CATEGORIES_DATA.map(cat => {
                const budget = mode === 'M' ? cat.monthlyBudget : cat.yearlyBudget;
                const spent = mode === 'M' ? cat.monthlySpent : cat.yearlySpent;
                const pct = pctOf(spent, budget);
                const remaining = budget - spent;
                return (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                        cat.type === 'COGS' ? "bg-indigo-50 text-indigo-600" : cat.type === 'OPEX' ? "bg-purple-50 text-purple-600" : "bg-teal-50 text-teal-600"
                      )}>{cat.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">{fmt.currency(budget, 'USD', true)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-negative">{fmt.currency(spent, 'USD', true)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-mono", remaining < 0 ? "text-negative" : "text-positive")}>
                        {remaining < 0 ? '-' : ''}{fmt.currency(Math.abs(remaining), 'USD', true)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <span className={cn("text-xs font-mono font-semibold", pct > 100 ? "text-negative" : pct > 80 ? "text-warning" : "text-positive")}>{pct}%</span>
                        <MiniProgressBar value={spent} max={budget} color={cat.color} className="w-14" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px]", pct > 100 ? "text-negative" : "text-positive")}>
                        {pct > 100 ? '↑ Over' : pct > 80 ? '~ Near limit' : '↓ On track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}