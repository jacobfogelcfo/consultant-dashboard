import { cn } from "@/lib/utils";
import { fmt } from "@/utils/format";
import { CLIENTS, CC_ACCOUNTS, BANK_ACCOUNTS } from "@/data/seedData";
import { CheckCircle2, Clock, CreditCard, Repeat, ArrowUpRight, ArrowDownRight, Zap, Calendar } from "lucide-react";

export function TransactionCard({ tx, onAction }) {
  const client = tx.clientId ? CLIENTS.find(c => c.id === tx.clientId) : null;
  const isIncome = tx.type === 'income';
  const isPaid = tx.status === 'paid';
  const isProjected = tx.isProjected;

  // CC balance remaining after this charge
  const ccAccount = tx.isCC && tx.ccAccount ? CC_ACCOUNTS.find(c => c.name === tx.ccAccount) : null;
  const ccRemainingAfter = ccAccount ? ccAccount.limit - ccAccount.spent - Math.abs(tx.amount) : null;

  // Bank balance after this transaction (for non-CC)
  const bankAccount = !tx.isCC && tx.bank ? BANK_ACCOUNTS.find(b => b.bank === tx.bank) : null;
  const bankBalanceAfter = bankAccount ? bankAccount.balance + tx.amount : null;

  return (
    <div className={cn(
      "panel-card overflow-hidden transition-all duration-200 hover:shadow-md",
      isProjected && "opacity-75 border-dashed",
    )}>
      {/* Main content */}
      <div className="p-3.5 pb-2.5">
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

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tx.isCC && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
              <CreditCard className="w-2.5 h-2.5" />
              {tx.ccAccount || 'CC'}
            </span>
          )}
          {tx.recurring && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
              <Repeat className="w-2.5 h-2.5" />
              {tx.recurringFreq}
            </span>
          )}
          {isProjected && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-dashed border-slate-300">
              <Zap className="w-2.5 h-2.5" />
              Projected
            </span>
          )}
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {tx.category}
          </span>
        </div>

        {/* Balance impact */}
        {(ccAccount || bankAccount) && (
          <div className="mt-2 text-[10px]">
            {ccAccount && ccRemainingAfter !== null && (
              <span className={cn("text-muted-foreground", ccRemainingAfter < 0 ? "text-negative" : "")}>
                CC remaining after: <span className="font-mono font-medium">{fmt.currency(ccRemainingAfter, ccAccount.currency, true)}</span>
              </span>
            )}
            {bankAccount && bankBalanceAfter !== null && (
              <span className={cn("text-muted-foreground", bankBalanceAfter < 0 ? "text-negative" : "")}>
                {bankAccount.bank} balance after: <span className="font-mono font-medium">{fmt.currency(bankBalanceAfter, bankAccount.currency, true)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer bar — always consistent */}
      <div className={cn(
        "flex items-center justify-between px-3.5 py-2 border-t",
        isPaid ? "border-green-100 bg-green-50/40" : isProjected ? "border-indigo-100 bg-indigo-50/30" : "border-amber-100 bg-amber-50/30"
      )}>
        {/* Left: status + date */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[10px] font-semibold",
            isPaid ? "text-green-700" : isProjected ? "text-indigo-600" : "text-amber-700"
          )}>
            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isPaid ? 'Paid' : isProjected ? 'Projected' : 'Pending'}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="w-2.5 h-2.5" />
            {isPaid ? (
              <span>{tx.date}</span>
            ) : (
              <span>Expected: <span className="font-medium text-foreground">{tx.dueDate || tx.date}</span></span>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1">
          {!isPaid && !isProjected && (
            <button
              onClick={() => onAction('mark_paid', tx)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Mark Paid
            </button>
          )}
          <button
            onClick={() => onAction('edit', tx)}
            className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}