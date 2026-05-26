import { useState } from "react";
import { X, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { CLIENT_MONTHLY_DATA } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const YEAR_FILTERS = ['All Time', '2025', '2024'];
const TABLE_MODES = ['By Month', 'By Category'];

// Category constants for "By Category" view
const CATEGORIES_LIST = ['Travel', 'Subcontractors', 'Design', 'Meals'];
const CAT_COLORS = { Travel: '#6366f1', Subcontractors: '#8b5cf6', Design: '#ec4899', Meals: '#f59e0b' };

function MonthRow({ row }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => setExpanded(!expanded)}>
        <td className="px-3 py-2.5 text-xs font-medium text-foreground whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            {row.month}
          </div>
        </td>
        <td className="px-3 py-2.5 text-xs font-mono text-right text-positive">{fmt.currency(row.revenue, 'USD', true)}</td>
        <td className="px-3 py-2.5 text-xs font-mono text-right text-negative">{fmt.currency(-row.expenses, 'USD', true)}</td>
        <td className="px-3 py-2.5 text-xs font-mono text-right text-positive">{fmt.currency(row.reimbursements, 'USD', true)}</td>
        <td className="px-3 py-2.5 text-xs font-mono text-right font-semibold" style={{ color: row.net >= 0 ? 'hsl(152 60% 40%)' : 'hsl(0 72% 55%)' }}>
          {fmt.currency(row.net, 'USD', true)}
        </td>
        <td className="px-3 py-2.5 text-xs font-mono text-right text-muted-foreground">{row.margin}%</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="px-0 py-0">
            <div className="bg-muted/20 border-t border-b border-border/40 px-8 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Line Items</p>
              <div className="space-y-1">
                {row.lineItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", item.type === 'reimbursement' ? "bg-teal-400" : "bg-red-400")} />
                      <span className="text-[11px] text-foreground">{item.category}</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", item.type === 'reimbursement' ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-500")}>
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono">{fmt.currency(item.amount, 'USD', true)}</span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ByCategoryView({ filteredData }) {
  // Aggregate spend per category across all months
  const catTotals = {};
  CATEGORIES_LIST.forEach(cat => {
    const vals = filteredData.map(d => {
      const item = d.lineItems.find(l => l.category === cat);
      return item ? item.amount : 0;
    });
    catTotals[cat] = {
      total: vals.reduce((s, v) => s + v, 0),
      avg: Math.round(vals.reduce((s, v) => s + v, 0) / (vals.length || 1)),
      months: vals,
    };
  });

  // Monthly chart data
  const chartData = filteredData.map(d => {
    const entry = { month: d.month };
    CATEGORIES_LIST.forEach(cat => {
      const item = d.lineItems.find(l => l.category === cat);
      entry[cat] = item ? item.amount : 0;
    });
    return entry;
  });

  return (
    <div className="space-y-4">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={32} />
            <Tooltip formatter={(v) => fmt.currency(v, 'USD', true)} labelStyle={{ fontSize: 10 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            {CATEGORIES_LIST.map(cat => (
              <Bar key={cat} dataKey={cat} fill={CAT_COLORS[cat]} stackId="cat" radius={[0, 0, 0, 0]} opacity={0.8} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Total</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Monthly Avg</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">% of Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {CATEGORIES_LIST.map(cat => {
              const totalSpend = Object.values(catTotals).reduce((s, v) => s + v.total, 0);
              const d = catTotals[cat];
              return (
                <tr key={cat} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[cat] }} />
                      {cat}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-right text-negative">{fmt.currency(-d.total, 'USD', true)}</td>
                  <td className="px-3 py-2 text-xs font-mono text-right text-muted-foreground">{fmt.currency(-d.avg, 'USD', true)}</td>
                  <td className="px-3 py-2 text-xs font-mono text-right text-muted-foreground">{totalSpend ? Math.round(d.total / totalSpend * 100) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BudgetAnalysisTab({ client, filteredData }) {
  const monthlyExpenses = filteredData.map(d => d.expenses);
  const avg = monthlyExpenses.length ? Math.round(monthlyExpenses.reduce((s, v) => s + v, 0) / monthlyExpenses.length) : 0;
  const sorted = [...monthlyExpenses].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const max = Math.max(...monthlyExpenses, 0);
  const min = Math.min(...monthlyExpenses, Infinity) === Infinity ? 0 : Math.min(...monthlyExpenses);
  const variance = monthlyExpenses.length ? Math.round(Math.sqrt(monthlyExpenses.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / monthlyExpenses.length)) : 0;
  const suggested = Math.round(avg * 1.1);
  const budgetSpent = client.monthlyBudget * filteredData.length;
  const totalExp = filteredData.reduce((s, d) => s + d.expenses, 0);
  const budgetPct = budgetSpent ? Math.round((totalExp / budgetSpent) * 100) : 0;

  const [budget, setBudget] = useState(client.monthlyBudget);

  const chartData = filteredData.map(d => ({ month: d.month, actual: d.expenses, budget: budget }));

  // Category breakdown
  const catBreakdown = CATEGORIES_LIST.map(cat => {
    const total = filteredData.reduce((s, d) => {
      const item = d.lineItems.find(l => l.category === cat);
      return s + (item ? item.amount : 0);
    }, 0);
    return { cat, total };
  });
  const totalCat = catBreakdown.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Monthly Avg Spend', value: avg, color: 'text-foreground' },
          { label: 'Median Spend', value: median, color: 'text-foreground' },
          { label: 'Std Deviation', value: variance, color: 'text-warning' },
          { label: 'Max Month', value: max, color: 'text-negative' },
          { label: 'Min Month', value: min, color: 'text-positive' },
          { label: 'Suggested (+10%)', value: suggested, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="panel-card p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground mb-1">{s.label}</p>
            <p className={cn("text-xs font-bold font-mono", s.color)}>{fmt.currency(s.value, 'USD', true)}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Spend vs Budget</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={32} />
              <Tooltip formatter={(v) => fmt.currency(v, 'USD', true)} labelStyle={{ fontSize: 10 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <ReferenceLine y={budget} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Budget', fontSize: 8, fill: '#10b981', position: 'right' }} />
              <ReferenceLine y={avg} stroke="#6366f1" strokeDasharray="4 3" label={{ value: 'Avg', fontSize: 8, fill: '#6366f1', position: 'right' }} />
              <Bar dataKey="actual" name="Actual Spend" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Spend by Category</p>
        <div className="space-y-2">
          {catBreakdown.map(({ cat, total }) => (
            <div key={cat}>
              <div className="flex justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAT_COLORS[cat] }} />
                  <span className="text-xs text-foreground">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{totalCat ? Math.round(total / totalCat * 100) : 0}%</span>
                  <span className="text-xs font-mono">{fmt.currency(total, 'USD', true)}</span>
                </div>
              </div>
              <MiniProgressBar value={total} max={totalCat} color={CAT_COLORS[cat]} />
            </div>
          ))}
        </div>
      </div>

      {/* Set budget */}
      <div className="panel-card p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">Set Monthly Budget</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button onClick={() => setBudget(suggested)} className="px-3 py-2 text-xs rounded-xl border border-primary/30 text-primary hover:bg-primary/5 transition-colors whitespace-nowrap">
            Use suggested
          </button>
        </div>
        <div className="flex gap-1.5">
          {[avg, Math.round(avg * 1.1), Math.round(avg * 1.2), max].map((v, i) => (
            <button key={i} onClick={() => setBudget(v)} className={cn(
              "flex-1 text-[9px] py-1.5 rounded-lg border transition-all",
              budget === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            )}>
              {['Avg', '+10%', '+20%', 'Max'][i]}<br />
              <span className="font-mono font-medium text-[10px]">{fmt.currency(v, 'USD', true)}</span>
            </button>
          ))}
        </div>
        {variance / (avg || 1) > 0.3 && (
          <p className="text-[11px] text-warning bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            ⚠ High variance ({Math.round(variance / (avg || 1) * 100)}% of avg). Consider setting budget closer to max.
          </p>
        )}
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-foreground">YTD Budget Utilization</span>
          <span className={cn("text-xs font-mono font-semibold", budgetPct > 100 ? "text-negative" : budgetPct > 80 ? "text-warning" : "text-positive")}>{budgetPct}%</span>
        </div>
        <MiniProgressBar value={totalExp} max={budgetSpent} color={client.color} />
      </div>
    </div>
  );
}

export function ClientSidePeek({ client, onClose }) {
  const [yearFilter, setYearFilter] = useState('2025');
  const [tableMode, setTableMode] = useState('By Month');
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) return null;

  const monthlyData = CLIENT_MONTHLY_DATA[client.id] || [];
  const filteredData = yearFilter === 'All Time'
    ? monthlyData
    : monthlyData.filter(d => d.month.includes(yearFilter.slice(2)));

  const totalRev = filteredData.reduce((s, d) => s + d.revenue, 0);
  const totalExp = filteredData.reduce((s, d) => s + d.expenses, 0);
  const totalReimb = filteredData.reduce((s, d) => s + d.reimbursements, 0);
  const totalNet = filteredData.reduce((s, d) => s + d.net, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl h-full bg-background border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold" style={{ backgroundColor: client.color }}>
              {client.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.industry} · {client.status === 'active' ? '🟢 Active' : '⚫ Inactive'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-border pb-0 flex-shrink-0 overflow-x-auto">
          {['overview', 'contract', 'budget', 'table'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "text-xs font-semibold px-3 py-2 rounded-t-lg capitalize border-b-2 transition-all whitespace-nowrap",
              activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
              {tab === 'table' ? 'Monthly Table' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">What We Do</p>
                <p className="text-sm text-foreground leading-relaxed">{client.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {client.services.map(s => (
                    <span key={s} className="text-xs px-3 py-1.5 bg-primary/5 text-primary rounded-lg border border-primary/20 font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Payment Amount', value: fmt.currency(client.paymentAmount, client.paymentCurrency) },
                  { label: 'Cadence', value: client.paymentCadence },
                  { label: 'Payment Detail', value: client.paymentCadenceDetail },
                  { label: 'Currency', value: client.paymentCurrency },
                ].map(f => (
                  <div key={f.label} className="panel-card p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{f.label}</p>
                    <p className="text-sm font-semibold text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'YTD Revenue', value: fmt.currency(totalRev, 'USD', true), color: 'text-positive' },
                  { label: 'YTD Expenses', value: fmt.currency(totalExp, 'USD', true), color: 'text-negative' },
                  { label: 'Reimbursed', value: fmt.currency(totalReimb, 'USD', true), color: 'text-teal-600' },
                  { label: 'Net', value: fmt.currency(totalNet, 'USD', true), color: totalNet >= 0 ? 'text-positive' : 'text-negative' },
                ].map(s => (
                  <div key={s.label} className="panel-card p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                    <p className={cn("text-sm font-bold font-mono", s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="space-y-4">
              <div className="panel-card p-4 flex items-center gap-3 border-dashed border-primary/40">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Contract PDF</p>
                  <p className="text-xs text-muted-foreground">Upload or link contract document</p>
                </div>
                <button className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors">Upload</button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Payment Amount', type: 'number', value: client.paymentAmount },
                  { label: 'Payment Cadence', type: 'select', value: client.paymentCadence, options: ['monthly', 'quarterly', 'annually'] },
                  { label: 'Cadence Detail', type: 'text', value: client.paymentCadenceDetail },
                  { label: 'Currency', type: 'select', value: client.paymentCurrency, options: ['USD', 'ILS', 'EUR'] },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    {field.type === 'select' ? (
                      <select defaultValue={field.value} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 capitalize">
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} defaultValue={field.value} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Description / Scope</label>
                  <textarea rows={4} defaultValue={client.description} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Service Lines</label>
                  <div className="mt-1 space-y-2">
                    {client.services.map((s, i) => (
                      <input key={i} defaultValue={s} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <BudgetAnalysisTab client={client} filteredData={filteredData} />
          )}

          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {YEAR_FILTERS.map(y => (
                    <button key={y} onClick={() => setYearFilter(y)} className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-lg transition-all",
                      yearFilter === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}>{y}</button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {TABLE_MODES.map(m => (
                    <button key={m} onClick={() => setTableMode(m)} className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-lg transition-all",
                      tableMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}>{m}</button>
                  ))}
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-xl border border-border">
                {[
                  { label: 'Total Revenue', value: totalRev, color: 'text-positive' },
                  { label: 'Total Expenses', value: -totalExp, color: 'text-negative' },
                  { label: 'Reimbursements', value: totalReimb, color: 'text-teal-600' },
                  { label: 'Net', value: totalNet, color: totalNet >= 0 ? 'text-positive' : 'text-negative' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    <p className={cn("text-xs font-bold font-mono mt-0.5", s.color)}>{fmt.currency(s.value, 'USD', true)}</p>
                  </div>
                ))}
              </div>

              {tableMode === 'By Month' && (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border">
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Month</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Revenue</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Expenses</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Reimb.</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Net</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredData.map((row, i) => <MonthRow key={i} row={row} />)}
                    </tbody>
                  </table>
                </div>
              )}

              {tableMode === 'By Category' && <ByCategoryView filteredData={filteredData} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border px-6 py-4 flex justify-between items-center">
          <button className="text-xs font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors">Export Data</button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}