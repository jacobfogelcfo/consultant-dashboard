import { X } from "lucide-react";
import { fmt } from "@/utils/format";
import { CLIENTS } from "@/data/seedData";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, CreditCard } from "lucide-react";

export function FeedTableModal({ transactions, onClose }) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Transaction Feed — Table View</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-positive font-mono">+{fmt.currency(totalIncome, 'USD', true)} income</span>
              <span className="text-xs text-negative font-mono">{fmt.currency(totalExpense, 'USD', true)} expenses</span>
              <span className="text-xs text-foreground font-mono font-semibold">Net: {fmt.currency(totalIncome + totalExpense, 'USD', true)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
              <tr>
                {['Date', 'Description', 'Vendor', 'Client', 'Category', 'Method', 'Status', 'Amount', 'Currency'].map(h => (
                  <th key={h} className="px-3 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.map(tx => {
                const client = tx.clientId ? CLIENTS.find(c => c.id === tx.clientId) : null;
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-foreground max-w-[160px] truncate">{tx.description}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{tx.vendor}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {client ? (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: client.color }} />
                          <span className="text-muted-foreground">{client.name}</span>
                        </div>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="bg-muted px-1.5 py-0.5 rounded-full">{tx.category}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {tx.isCC
                        ? <span className="inline-flex items-center gap-0.5 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full text-[10px]"><CreditCard className="w-2.5 h-2.5" />CC</span>
                        : <span className="text-[10px] text-muted-foreground">{tx.bank || 'Bank'}</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        tx.status === 'paid' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {tx.status === 'paid' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className={cn("px-3 py-2.5 text-xs font-mono font-semibold whitespace-nowrap", isIncome ? "text-positive" : "text-negative")}>
                      {isIncome ? '+' : ''}{fmt.currency(tx.amount, tx.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{tx.currency}</td>
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