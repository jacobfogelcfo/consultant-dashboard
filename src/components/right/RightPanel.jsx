import { useState } from "react";
import { cn } from "@/lib/utils";
import { TransactionCard } from "./TransactionCard";
import { TRANSACTIONS, CC_ACCOUNTS } from "@/data/seedData";
import { fmt, pctOf } from "@/utils/format";
import { Plus, CreditCard, ChevronDown, ChevronUp, X, Check, Table2, Pencil } from "lucide-react";
import { AddTransactionModal } from "./AddTransactionModal";
import { FeedTableModal } from "./FeedTableModal";

const STATUS_FILTERS = ['All', 'Pending', 'Paid'];
const TYPE_FILTERS = ['All', 'Income', 'Expense'];

function EditCCLimitModal({ cc, onClose, onSave }) {
  const [limit, setLimit] = useState(cc.limit);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-xs animate-slide-up p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Edit CC Limit — {cc.name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Credit Limit ({cc.currency})</label>
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 text-sm font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Spent: {fmt.currency(cc.spent, cc.currency)} · Available after: {fmt.currency(limit - cc.spent, cc.currency)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={() => onSave(limit)} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">Save</button>
        </div>
      </div>
    </div>
  );
}

export function RightPanel() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showFeedTable, setShowFeedTable] = useState(false);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [showCC, setShowCC] = useState(true);
  const [ccAccounts, setCcAccounts] = useState(CC_ACCOUNTS);
  const [editingCC, setEditingCC] = useState(null);

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

  const handleSaveCCLimit = (limit) => {
    setCcAccounts(prev => prev.map(cc => cc.id === editingCC.id ? { ...cc, limit } : cc));
    setEditingCC(null);
  };

  const totalCCSpent = ccAccounts.reduce((s, cc) => s + cc.spent, 0);
  const totalCCLimit = ccAccounts.reduce((s, cc) => s + cc.limit, 0);

  return (
    <div className="flex flex-col h-full panel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Income / Expense Feed</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFeedTable(true)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Table view"
          >
            <Table2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-border/40 flex-shrink-0">
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={cn(
              "text-[10px] font-semibold px-2 py-1 rounded-md transition-all",
              statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>{f}</button>
          ))}
          <div className="h-4 w-px bg-border mx-0.5 self-center" />
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} className={cn(
              "text-[10px] font-semibold px-2 py-1 rounded-md transition-all",
              typeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>{f}</button>
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
            {ccAccounts.map(cc => {
              const pct = pctOf(cc.spent, cc.limit);
              return (
                <div key={cc.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <button
                      className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                      onClick={() => setEditingCC(cc)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cc.color }} />
                      <span className="text-xs text-foreground group-hover:text-primary">{cc.name}</span>
                      <Pencil className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{fmt.currency(cc.spent, cc.currency, true)} / {fmt.currency(cc.limit, cc.currency, true)}</span>
                      <span className="text-[10px] text-muted-foreground">Due {cc.dueDate}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : cc.color }} />
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
      {showFeedTable && <FeedTableModal transactions={filtered} onClose={() => setShowFeedTable(false)} />}
      {editingCC && <EditCCLimitModal cc={editingCC} onClose={() => setEditingCC(null)} onSave={handleSaveCCLimit} />}
    </div>
  );
}