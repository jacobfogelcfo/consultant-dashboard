import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PNL_DATA, CLIENTS, CATEGORIES } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";

const ROWS = [
  { id: 'revenue', label: 'Total Revenue', bold: true, positive: true, indent: 0 },
  { id: 'cogs', label: 'COGS', indent: 0, section: true },
  { id: 'travel', label: 'Travel', indent: 1, catKey: 'travel' },
  { id: 'meals', label: 'Meals & Entertainment', indent: 1, catKey: 'meals' },
  { id: 'design', label: 'Design', indent: 1, catKey: 'design' },
  { id: 'subcontractors', label: 'Subcontractors', indent: 1, catKey: 'subcontractors' },
  { id: 'total_cogs', label: 'Total COGS', bold: true, indent: 0, derived: 'cogs' },
  { id: 'opex', label: 'OPEX', indent: 0, section: true },
  { id: 'salary', label: 'Salary', indent: 1, catKey: 'salary' },
  { id: 'software', label: 'Software & Tools', indent: 1, catKey: 'software' },
  { id: 'marketing', label: 'Marketing', indent: 1, catKey: 'marketing' },
  { id: 'legal', label: 'Legal & Accounting', indent: 1, catKey: 'legal' },
  { id: 'office', label: 'Office & Admin', indent: 1, catKey: 'office' },
  { id: 'total_opex', label: 'Total OPEX', bold: true, indent: 0, derived: 'opex' },
  { id: 'reimbursements', label: 'Reimbursements', indent: 0, positive: true },
  { id: 'net', label: 'Net Income', bold: true, indent: 0 },
  { id: 'margin', label: 'NI Margin %', bold: true, indent: 0, isPercent: true },
];

function getValue(row, monthData) {
  if (!monthData) return 0;
  if (row.id === 'revenue') return monthData.revenue;
  if (row.id === 'reimbursements') return monthData.reimbursements;
  if (row.id === 'net') return monthData.net;
  if (row.id === 'margin') return monthData.margin;
  if (row.derived === 'cogs') return monthData.cogs;
  if (row.derived === 'opex') return monthData.opex;
  if (row.catKey) return monthData.byCategory?.[row.catKey] || 0;
  return null;
}

export function PnLTableModal({ onClose }) {
  const [windowStart, setWindowStart] = useState(0);
  const visibleCount = 6;

  const months = PNL_DATA;
  const visibleMonths = months.slice(windowStart, windowStart + visibleCount);

  const rowTotal = (row) => visibleMonths.reduce((s, m) => s + (getValue(row, m) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-5xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">P&L — Full Table View</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All line items · {months.length} months of data</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWindowStart(Math.max(0, windowStart - visibleCount))} disabled={windowStart === 0} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWindowStart(Math.min(months.length - visibleCount, windowStart + visibleCount))} disabled={windowStart + visibleCount >= months.length} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground ml-2 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <tr>
                <th className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-48">Category</th>
                {visibleMonths.map(m => (
                  <th key={m.month} className={cn(
                    "px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-right whitespace-nowrap min-w-[90px]",
                    m.isProjected ? "text-indigo-400" : "text-muted-foreground"
                  )}>
                    {m.month}
                    {m.isProjected && <span className="ml-1 text-[8px]">proj</span>}
                  </th>
                ))}
                <th className="px-3 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right whitespace-nowrap min-w-[90px] border-l border-border">Total</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                const total = rowTotal(row);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t transition-colors",
                      row.section ? "bg-muted/40" : row.bold ? "bg-muted/20" : "hover:bg-muted/20",
                      row.indent === 1 ? "border-border/30" : "border-border/60"
                    )}
                  >
                    <td className={cn(
                      "px-4 py-2.5 text-xs whitespace-nowrap",
                      row.bold ? "font-bold text-foreground" : row.section ? "font-semibold text-foreground" : "text-muted-foreground",
                      row.indent === 1 && "pl-8"
                    )}>
                      {row.label}
                    </td>
                    {visibleMonths.map(m => {
                      const val = getValue(row, m);
                      if (val === null) return <td key={m.month} />;
                      const isNeg = !row.positive && !row.isPercent && val > 0 && row.id !== 'net';
                      return (
                        <td key={m.month} className={cn(
                          "px-3 py-2.5 text-xs font-mono text-right",
                          row.bold ? "font-semibold" : "",
                          m.isProjected ? "text-indigo-400" : isNeg ? "text-negative" : val >= 0 && row.positive ? "text-positive" : row.id === 'net' ? (val >= 0 ? "text-positive" : "text-negative") : "text-foreground"
                        )}>
                          {row.isPercent ? `${val}%` : fmt.currency(val, 'USD', true)}
                        </td>
                      );
                    })}
                    <td className={cn(
                      "px-3 py-2.5 text-xs font-mono text-right border-l border-border",
                      row.bold ? "font-bold" : "font-medium",
                      total >= 0 && row.positive ? "text-positive" : !row.positive && !row.isPercent && total > 0 && row.id !== 'net' ? "text-negative" : row.id === 'net' ? (total >= 0 ? "text-positive" : "text-negative") : "text-foreground"
                    )}>
                      {row.isPercent ? `${Math.round(total / visibleMonths.length)}%` : fmt.currency(total, 'USD', true)}
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