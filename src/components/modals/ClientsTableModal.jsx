import { X } from "lucide-react";
import { CLIENTS, CLIENT_MONTHLY_DATA } from "@/data/seedData";
import { fmt, pctOf } from "@/utils/format";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";
import { cn } from "@/lib/utils";

export function ClientsTableModal({ onClose, onClientClick }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Clients — Table View</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
              <tr>
                {['Client', 'Industry', 'Status', 'Payment', 'Cadence', 'Monthly Budget', 'Spent (M)', 'Budget %', 'YTD Revenue', 'Services'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {CLIENTS.map(client => {
                const monthlyData = CLIENT_MONTHLY_DATA[client.id] || [];
                const ytdRev = monthlyData.reduce((s, d) => s + d.revenue, 0);
                const monthSpent = Math.round(client.monthlyBudget * 0.71);
                const pct = pctOf(monthSpent, client.monthlyBudget);
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => { onClientClick(client); onClose(); }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: client.color }} />
                        <span className="text-xs font-semibold text-foreground">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{client.industry}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", client.status === 'active' ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground")}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">{fmt.currency(client.paymentAmount, client.paymentCurrency)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{client.paymentCadence}</td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">{fmt.currency(client.monthlyBudget, 'USD', true)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <span className={cn("text-xs font-mono", pct > 100 ? "text-negative" : "text-foreground")}>{fmt.currency(monthSpent, 'USD', true)}</span>
                        <MiniProgressBar value={monthSpent} max={client.monthlyBudget} color={client.color} className="w-16" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-mono font-semibold", pct > 100 ? "text-negative" : pct > 80 ? "text-warning" : "text-positive")}>{pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-positive">{fmt.currency(ytdRev, 'USD', true)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{client.services.slice(0, 2).join(', ')}{client.services.length > 2 ? '...' : ''}</td>
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