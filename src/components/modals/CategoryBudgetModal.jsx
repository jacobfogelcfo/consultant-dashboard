import { useState } from "react";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PNL_DATA, SPEND_CATEGORIES_DATA } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function CategoryBudgetModal({ category, onClose }) {
  // Build monthly data for this category
  const monthlyValues = PNL_DATA.filter(d => !d.isProjected).map(d => ({
    month: d.month,
    value: d.byCategory?.[category.catId] || Math.round((d.cogs + d.opex) * (0.05 + Math.random() * 0.15)),
  }));

  const values = monthlyValues.map(m => m.value);
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const variance = Math.round(Math.sqrt(values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length));
  const suggested = Math.round(avg * 1.1);

  const [budget, setBudget] = useState(suggested);
  const catData = SPEND_CATEGORIES_DATA.find(c => c.id === category.catId);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-lg animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">{category.label} — Budget</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on {monthlyValues.length} months of history</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Monthly Avg', value: avg, icon: Minus, color: 'text-foreground' },
              { label: 'Median', value: median, icon: Minus, color: 'text-foreground' },
              { label: 'Std Dev', value: variance, icon: TrendingUp, color: 'text-warning' },
              { label: 'Max Month', value: max, icon: TrendingUp, color: 'text-negative' },
              { label: 'Min Month', value: min, icon: TrendingDown, color: 'text-positive' },
              { label: 'Suggested (+10%)', value: suggested, icon: TrendingUp, color: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="panel-card p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                <p className={cn("text-sm font-bold font-mono", s.color)}>{fmt.currency(s.value, 'USD', true)}</p>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Monthly Spend Trend</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyValues} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, 'USD', true)} width={44} />
                  <Tooltip formatter={(v) => fmt.currency(v, 'USD', true)} labelStyle={{ fontSize: 10 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <ReferenceLine y={avg} stroke="#6366f1" strokeDasharray="4 3" label={{ value: 'Avg', fontSize: 9, fill: '#6366f1', position: 'right' }} />
                  <ReferenceLine y={budget} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Budget', fontSize: 9, fill: '#10b981', position: 'right' }} />
                  <Bar dataKey="value" name="Spend" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.75} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Set Monthly Budget</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => setBudget(suggested)}
                className="px-3 py-2 text-xs rounded-xl border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
              >
                Use suggested
              </button>
            </div>
            <div className="flex gap-2">
              {[avg, Math.round(avg * 1.1), Math.round(avg * 1.2), Math.round(avg * 1.5)].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setBudget(v)}
                  className={cn(
                    "flex-1 text-[10px] py-1.5 rounded-lg border transition-all",
                    budget === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {i === 0 ? 'Avg' : i === 1 ? '+10%' : i === 2 ? '+20%' : '+50%'}<br />
                  <span className="font-mono font-medium">{fmt.currency(v, 'USD', true)}</span>
                </button>
              ))}
            </div>
            {variance / avg > 0.3 && (
              <p className="text-[11px] text-warning bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                ⚠ High variance detected ({Math.round(variance / avg * 100)}% of avg). Consider setting budget closer to max.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
}