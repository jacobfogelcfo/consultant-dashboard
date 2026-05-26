import { useState } from "react";
import { X, FileText, ChevronDown, ChevronRight, ExternalLink, TrendingUp } from "lucide-react";
import { CLIENT_MONTHLY_DATA } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { cn } from "@/lib/utils";

const YEAR_FILTERS = ['All Time', '2025', '2024'];
const TABLE_MODES = ['By Month', 'By Category'];

function MonthRow({ row, clientId }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-muted/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-2.5 text-xs font-medium text-foreground whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            {row.month}
            {row.isProjected && <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1 rounded">proj</span>}
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

  const budgetSpent = client.monthlyBudget * filteredData.length;
  const budgetPct = Math.round((totalExp / budgetSpent) * 100);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
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
        <div className="flex gap-1 px-6 pt-4 border-b border-border pb-0 flex-shrink-0">
          {['overview', 'contract', 'budget', 'table'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-xs font-semibold px-3 py-2 rounded-t-lg capitalize border-b-2 transition-all",
                activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === 'table' ? 'Monthly Table' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* OVERVIEW */}
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
                    <span key={s} className="text-xs px-3 py-1.5 bg-primary/8 text-primary rounded-lg border border-primary/20 font-medium">{s}</span>
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

              {/* Quick stats */}
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

          {/* CONTRACT */}
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
                <button className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  Upload
                </button>
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

          {/* BUDGET */}
          {activeTab === 'budget' && (
            <div className="space-y-5">
              <div className="panel-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Budget Settings</h3>
                  <span className="text-xs text-muted-foreground">Based on {filteredData.length} months history</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Monthly Budget', value: client.monthlyBudget },
                    { label: 'Yearly Budget', value: client.yearlyBudget },
                    { label: 'Avg Monthly Spend', value: Math.round(totalExp / (filteredData.length || 1)) },
                    { label: 'Suggested Budget', value: Math.round(totalExp / (filteredData.length || 1) * 1.15) },
                  ].map(f => (
                    <div key={f.label} className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">{f.label}</label>
                      <input
                        type="number"
                        defaultValue={f.value}
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">YTD Budget Utilization</span>
                    <span className={cn("text-xs font-mono font-semibold", budgetPct > 100 ? "text-negative" : budgetPct > 80 ? "text-warning" : "text-positive")}>
                      {budgetPct}%
                    </span>
                  </div>
                  <MiniProgressBar value={totalExp} max={budgetSpent} color={client.color} />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Spent: {fmt.currency(totalExp, 'USD', true)}</span>
                    <span className="text-[10px] text-muted-foreground">Budget: {fmt.currency(budgetSpent, 'USD', true)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {YEAR_FILTERS.map(y => (
                    <button
                      key={y}
                      onClick={() => setYearFilter(y)}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg transition-all",
                        yearFilter === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {TABLE_MODES.map(m => (
                    <button
                      key={m}
                      onClick={() => setTableMode(m)}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg transition-all",
                        tableMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {m}
                    </button>
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

              {/* Table */}
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
                    {filteredData.map((row, i) => (
                      <MonthRow key={i} row={row} clientId={client.id} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border px-6 py-4 flex justify-between items-center">
          <button className="text-xs font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors">
            Export Data
          </button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}