import { useState, useRef } from "react";
import { X } from "lucide-react";
import { PNL_DATA, CLIENTS, CATEGORIES } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";

const ROWS = [
  { id: 'revenue', label: 'Total Revenue', bold: true, positive: true, indent: 0 },
  { id: 'cogs_header', label: 'COGS', indent: 0, section: true },
  { id: 'travel', label: 'Travel', indent: 1, catKey: 'travel' },
  { id: 'meals', label: 'Meals & Entertainment', indent: 1, catKey: 'meals' },
  { id: 'design', label: 'Design', indent: 1, catKey: 'design' },
  { id: 'subcontractors', label: 'Subcontractors', indent: 1, catKey: 'subcontractors' },
  { id: 'total_cogs', label: 'Total COGS', bold: true, indent: 0, derived: 'cogs' },
  { id: 'opex_header', label: 'OPEX', indent: 0, section: true },
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

const YEARS = ['All', '2024', '2025'];

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
  const [yearFilter, setYearFilter] = useState('All');

  const months = yearFilter === 'All'
    ? PNL_DATA
    : PNL_DATA.filter(m => m.month.includes(yearFilter.slice(2)));

  const rowTotal = (row) => months.reduce((s, m) => s + (getValue(row, m) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-6xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground">P&L — Full Table View</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{months.length} months · scroll horizontally to see all</p>
            </div>
            {/* Year filter */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setYearFilter(y)}
                  className={cn(
                    "text-[11px] font-semibold px-3 py-1 rounded-md transition-all",
                    yearFilter === y ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable table — both directions */}
        <div className="overflow-auto flex-1">
          <table className="text-left" style={{ minWidth: `${Math.max(800, 192 + months.length * 90 + 100)}px` }}>
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur-sm px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide" style={{ minWidth: '180px' }}>
                  Category
                </th>
                {months.map(m => (
                  <th key={m.month} className={cn(
                    "px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-right whitespace-nowrap",
                    m.isProjected ? "text-indigo-400" : "text-muted-foreground"
                  )} style={{ minWidth: '88px' }}>
                    {m.month}
                    {m.isProjected && <span className="block text-[8px] text-indigo-300">proj</span>}
                  </th>
                ))}
                <th className="sticky right-0 bg-muted/95 backdrop-blur-sm px-3 py-3 text-[10px] font-semibold text-foreground uppercase tracking-wide text-right whitespace-nowrap border-l border-border" style={{ minWidth: '88px' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const total = rowTotal(row);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t transition-colors",
                      row.section ? "bg-slate-50" : row.bold ? "bg-muted/20" : "hover:bg-muted/20",
                      row.indent === 1 ? "border-border/30" : "border-border/60"
                    )}
                  >
                    <td className={cn(
                      "sticky left-0 z-10 px-4 py-2.5 text-xs whitespace-nowrap border-r border-border/40",
                      row.bold ? "font-bold text-foreground bg-muted/30" : row.section ? "font-semibold text-foreground bg-slate-50" : "text-muted-foreground bg-background",
                      row.indent === 1 && "pl-8"
                    )}>
                      {row.label}
                    </td>
                    {months.map(m => {
                      const val = getValue(row, m);
                      if (val === null) return <td key={m.month} className="px-3 py-2.5" />;
                      const isExpense = !row.positive && !row.isPercent && row.id !== 'net' && !row.section;
                      return (
                        <td key={m.month} className={cn(
                          "px-3 py-2.5 text-xs font-mono text-right",
                          row.bold ? "font-semibold" : "",
                          m.isProjected
                            ? "text-indigo-400"
                            : isExpense
                            ? "text-negative"
                            : row.positive
                            ? "text-positive"
                            : row.id === 'net'
                            ? (val >= 0 ? "text-positive" : "text-negative")
                            : "text-foreground"
                        )}>
                          {row.isPercent ? `${val}%` : fmt.currency(val, 'USD', true)}
                        </td>
                      );
                    })}
                    <td className={cn(
                      "sticky right-0 bg-muted/20 backdrop-blur-sm px-3 py-2.5 text-xs font-mono text-right border-l border-border",
                      row.bold ? "font-bold" : "font-medium",
                      !row.positive && !row.isPercent && row.id !== 'net' && !row.section ? "text-negative"
                        : row.positive ? "text-positive"
                        : row.id === 'net' ? (total >= 0 ? "text-positive" : "text-negative")
                        : "text-foreground"
                    )}>
                      {row.isPercent ? `${Math.round(total / (months.length || 1))}%` : fmt.currency(total, 'USD', true)}
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