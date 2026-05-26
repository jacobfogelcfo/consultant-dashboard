import { useState } from "react";
import { cn } from "@/lib/utils";
import { TransactionCard } from "./TransactionCard";
import { TRANSACTIONS, CC_ACCOUNTS } from "@/data/seedData";
import { fmt, pctOf } from "@/utils/format";
import { Plus, SlidersHorizontal, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { AddTransactionModal } from "./AddTransactionModal";

const STATUS_FILTERS = ['All', 'Pending', 'Paid'];
const TYPE_FILTERS = ['All', 'Income', 'Expense'];

export function RightPanel() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [showCC, setShowCC] = useState(true);

  const filtered = transactions.filter(tx => {
    if (statusFilter === 'Pending' && tx.status !== 'pending') return false;
    if (statusFilter === 'Paid' && tx.status !== 'paid') return false;
    if (typeFilter === 'Income' && tx.type !== 'income') return false;
    if (typeFilter === 'Expense' && tx.type !== 'expense') return false;
    return true;
  });

  const handleAction = (action, tx) => {
    if (action === 'mark_paid') {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'paid' } : t));
    }
  };

  const handleAdd = (tx) => {
    setTransactions(prev => [{ ...tx, id: `tx-new-${Date.now()}` }, ...prev]);
    setShowAdd(false);
  };

  const totalCCSpent = CC_ACCOUNTS.reduce((s, cc) => s + cc.spent, 0);
  const totalCCLimit = CC_ACCOUNTS.reduce((s, cc) => s + cc.limit, 0);

  return (
    <div className="flex flex-col h-full panel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Income / Expense Feed</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-border/40 space-y-2 flex-shrink-0">
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "text-[10px] font-semibold px-2 py-1 rounded-md transition-all",
                statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
          <div className="h-4 w-px bg-border mx-0.5 self-center" />
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "text-[10px] font-semibold px-2 py-1 rounded-md transition-all",
                typeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* CC Summary */}
      <div className="flex-shrink-0 border-b border-border/40">
        <button
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
          onClick={() => setShowCC(!showCC)}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Credit Cards</span>
            <span className="text-xs font-mono text-negative">{fmt.currency(-totalCCSpent, 'USD', true)}</span>
            <span className="text-[10px] text-muted-foreground">of {fmt.currency(totalCCLimit, 'USD', true)}</span>
          </div>
          {showCC ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>

        {showCC && (
          <div className="px-4 pb-3 space-y-2 animate-slide-up">
            {CC_ACCOUNTS.map(cc => {
              const pct = pctOf(cc.spent, cc.limit);
              return (
                <div key={cc.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cc.color }} />
                      <span className="text-xs text-foreground">{cc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{fmt.currency(cc.spent, cc.currency, true)} / {fmt.currency(cc.limit, cc.currency, true)}</span>
                      <span className="text-[10px] text-muted-foreground">Due {cc.dueDate}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : cc.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {filtered.map(tx => (
          <TransactionCard key={tx.id} tx={tx} onAction={handleAction} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No transactions match your filters</p>
          </div>
        )}
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}