import { useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { CASH_DATA, BANK_ACCOUNTS, CC_ACCOUNTS } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Pencil, Check, X, Table2 } from "lucide-react";
import { MiniProgressBar } from "@/components/shared/MiniProgressBar";

const CADENCES = ['Daily', 'Monthly'];
const TIME_RANGES = ['1Mo', '3Mo', '6Mo', '1Y'];
const BANKS = ['All Accounts', 'Hapoalim', 'Wells Fargo', 'Wise'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-medium">{p.name === 'ILS' ? '₪' : '$'}{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function EditableBalance({ account }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(account.balance);

  const sym = account.currency === 'ILS' ? '₪' : '$';

  return (
    <div className="flex items-center gap-1">
      {editing ? (
        <>
          <input
            type="number"
            value={val}
            onChange={e => setVal(Number(e.target.value))}
            className="w-24 text-xs font-mono px-1.5 py-0.5 border border-primary rounded-md bg-background focus:outline-none"
            autoFocus
          />
          <button onClick={() => setEditing(false)} className="p-0.5 text-green-600 hover:bg-green-50 rounded"><Check className="w-3 h-3" /></button>
          <button onClick={() => { setVal(account.balance); setEditing(false); }} className="p-0.5 text-red-500 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
        </>
      ) : (
        <>
          <span className="text-xs font-mono text-muted-foreground">{sym}{val.toLocaleString()}</span>
          <button onClick={() => setEditing(true)} className="p-0.5 text-muted-foreground hover:text-foreground rounded">
            <Pencil className="w-2.5 h-2.5" />
          </button>
        </>
      )}
    </div>
  );
}

export function CashProjection({ onTableView }) {
  const [cadence, setCadence] = useState('Daily');
  const [timeRange, setTimeRange] = useState('3Mo');
  const [activeBank, setActiveBank] = useState('All Accounts');

  const sliceMap = { '1Mo': 30, '3Mo': 90, '6Mo': 180, '1Y': 365 };
  const sliced = CASH_DATA.slice(0, sliceMap[timeRange]);

  const aggregated = cadence === 'Daily' ? sliced : sliced.filter((_, i) => i % 30 === 0);

  const ilsAccounts = BANK_ACCOUNTS.filter(a => a.currency === 'ILS');
  const usdAccounts = BANK_ACCOUNTS.filter(a => a.currency === 'USD');
  const totalILS = ilsAccounts.reduce((s, a) => s + a.balance, 0);
  const totalUSD = usdAccounts.reduce((s, a) => s + a.balance, 0);
  const totalCCSpent = CC_ACCOUNTS.reduce((s, cc) => s + cc.spent, 0);
  const totalCCLimit = CC_ACCOUNTS.reduce((s, cc) => s + cc.limit, 0);

  return (
    <div className="panel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <h2 className="text-base font-bold text-foreground">Cash Projection</h2>
        <button
          onClick={onTableView}
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
        >
          <Table2 className="w-3 h-3" />
          Table
        </button>
      </div>

      {/* Account tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0 overflow-x-auto">
        {BANKS.map(b => (
          <button
            key={b}
            onClick={() => setActiveBank(b)}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all",
              activeBank === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Cadence + time controls */}
      <div className="flex items-center justify-between px-5 pt-3 pb-0">
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          {CADENCES.map(c => (
            <button key={c} onClick={() => setCadence(c)} className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all",
              cadence === c ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>{c}</button>
          ))}
        </div>
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          {TIME_RANGES.map(t => (
            <button key={t} onClick={() => setTimeRange(t)} className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all",
              timeRange === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 pt-4 pb-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={aggregated} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ilsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={aggregated[0]?.date} stroke="hsl(220 15% 75%)" strokeDasharray="4 3" label={{ value: 'Now', fontSize: 8, fill: 'hsl(220 15% 55%)' }} />
            <Area dataKey="ils" name="ILS" stroke="#6366f1" strokeWidth={2} fill="url(#ilsGrad)" dot={false} />
            <Area dataKey="usd" name="USD" stroke="#10b981" strokeWidth={2} fill="url(#usdGrad)" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Balance Summary */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* USD Balances */}
          <div className="panel-card p-3 bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Dollar Balance</p>
            <p className="text-lg font-bold font-mono text-foreground">{fmt.currency(totalUSD, 'USD', true)}</p>
            <div className="mt-2 space-y-1">
              {usdAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{a.bank} {a.name.includes('FX') ? '(FX)' : ''}</span>
                  <EditableBalance account={a} />
                </div>
              ))}
            </div>
          </div>

          {/* ILS Balances */}
          <div className="panel-card p-3 bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Shekel Balance</p>
            <p className="text-lg font-bold font-mono text-foreground">₪{totalILS.toLocaleString()}</p>
            <div className="mt-2 space-y-1">
              {ilsAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{a.bank}</span>
                  <EditableBalance account={a} />
                </div>
              ))}
            </div>
          </div>

          {/* CC Balances */}
          <div className="panel-card p-3 bg-muted/30">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">CC Balance</p>
            <p className="text-lg font-bold font-mono text-negative">{fmt.currency(-totalCCSpent, 'USD', true)}</p>
            <p className="text-[10px] text-muted-foreground">{fmt.currency(totalCCLimit - totalCCSpent, 'USD', true)} remaining</p>
            <div className="mt-2 space-y-2">
              {CC_ACCOUNTS.map(cc => (
                <div key={cc.id}>
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cc.color }} />
                      <span className="text-[10px] text-foreground">{cc.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Due {cc.dueDate.split(', ')[0]}</span>
                  </div>
                  <MiniProgressBar value={cc.spent} max={cc.limit} color={cc.color} />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[9px] text-muted-foreground font-mono">{fmt.currency(cc.spent, cc.currency, true)}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">lim {fmt.currency(cc.limit, cc.currency, true)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}