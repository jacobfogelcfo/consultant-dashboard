import { cn } from "@/lib/utils";
import { fmt } from "@/utils/format";
import { CLIENTS } from "@/data/seedData";
import { CheckCircle2, Clock, CreditCard, Repeat, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";

export function TransactionCard({ tx, onAction }) {
  const client = tx.clientId ? CLIENTS.find(c => c.id === tx.clientId) : null;
  const isIncome = tx.type === 'income';
  const isPaid = tx.status === 'paid';
  const isProjected = tx.isProjected;

  return (
    <div className={cn(
      "panel-card p-3.5 transition-all duration-200 hover:shadow-md",
      isProjected && "opacity-75 border-dashed",
    )}>
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
            isIncome ? "bg-green-50" : "bg-red-50"
          )}>
            {isIncome
              ? <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
              : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">{tx.description}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">{tx.vendor}</span>
              {client && (
                <>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: client.color }} />
                    <span className="text-[10px] text-muted-foreground">{client.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={cn("text-sm font-bold font-mono", isIncome ? "text-positive" : "text-negative")}>
            {isIncome ? '+' : ''}{fmt.currency(tx.amount, tx.currency)}
          </p>
          <p className="text-[10px] text-muted-foreground">{tx.currency}</p>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            isPaid ? "bg-green-50 text-green-700" : isProjected ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-700"
          )}>
            {isPaid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
            {isPaid ? 'Paid' : isProjected ? 'Projected' : 'Pending'}
          </span>

          {tx.isCC && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
              <CreditCard className="w-2.5 h-2.5" />
              CC
            </span>
          )}
          {tx.recurring && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
              <Repeat className="w-2.5 h-2.5" />
              {tx.recurringFreq}
            </span>
          )}
          {tx.isProjected && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-dashed border-slate-300">
              <Zap className="w-2.5 h-2.5" />
              Projected
            </span>
          )}

          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {tx.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isPaid && !isProjected && (
            <button
              onClick={() => onAction('mark_paid', tx)}
              className="text-[10px] font-medium px-2 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Mark Paid
            </button>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="mt-2 pt-2 border-t border-border/40 flex justify-between">
        <span className="text-[10px] text-muted-foreground">{tx.date}</span>
        {tx.isCC && tx.ccAccount && (
          <span className="text-[10px] text-muted-foreground">{tx.ccAccount}</span>
        )}
        {tx.bank && (
          <span className="text-[10px] text-muted-foreground">{tx.bank}</span>
        )}
      </div>
    </div>
  );
}