import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, Cell
} from "recharts";
import { PNL_DATA, CLIENTS, CATEGORIES } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Table2, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { CategoryBudgetModal } from "@/components/modals/CategoryBudgetModal";

const VIEW_MODES = ['Total', 'By Client', 'By Category'];
const CADENCES = ['Monthly', 'Quarterly', 'Annual'];

const CLIENT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
const CAT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

// Date range presets
const DATE_PRESETS = [
  { label: '2024', from: 'Jul 24', to: 'Dec 24' },
  { label: '2025', from: 'Jan 25', to: 'Dec 25' },
  { label: '2025 YTD', from: 'Jan 25', to: 'Jun 25' },
  { label: 'All', from: null, to: null },
];

const CustomTooltip = ({ active, payload, label, isProjected }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn(
      "bg-card border rounded-xl shadow-xl p-3 text-xs min-w-[160px]",
      isProjected ? "border-indigo-200 bg-indigo-50/50" : "border-border"
    )}>
      <div className="flex items-center gap-1.5 mb-2">
        <p className="font-semibold text-foreground">{label}</p>
        {isProjected && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">Projected</span>}
      </div>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-medium text-foreground">{fmt.currency(p.value, 'USD', true)}</span>
        </div>
      ))}
    </div>
  );
};

function aggregateData(data, cadence) {
  if (cadence === 'Monthly') return data;
  const grouped = {};
  data.forEach((d, i) => {
    const key = cadence === 'Quarterly' ? `Q${Math.floor(i / 3) + 1} '${d.month.split(' ')[1] || '25'}` : `FY '${d.month.split(' ')[1] || '25'}`;
    if (!grouped[key]) grouped[key] = { month: key, revenue: 0, cogs: 0, opex: 0, net: 0, reimbursements: 0, isProjected: d.isProjected, byClient: {}, byCategory: {} };
    const g = grouped[key];
    g.revenue += d.revenue; g.cogs += d.cogs; g.opex += d.opex;
    g.net += d.net; g.reimbursements += d.reimbursements;
    if (d.isProjected) g.isProjected = true;
    Object.entries(d.byClient).forEach(([k, v]) => g.byClient[k] = (g.byClient[k] || 0) + v);
    Object.entries(d.byCategory).forEach(([k, v]) => g.byCategory[k] = (g.byCategory[k] || 0) + v);
  });
  return Object.values(grouped);
}

export function PnLChart({ onTableView }) {
  const [viewMode, setViewMode] = useState('Total');
  const [cadence, setCadence] = useState('Monthly');
  const [selectedPreset, setSelectedPreset] = useState('2025 YTD');
  const [budgetCategory, setBudgetCategory] = useState(null);

  const rawData = useMemo(() => {
    const preset = DATE_PRESETS.find(p => p.label === selectedPreset);
    if (!preset || !preset.from) return PNL_DATA;
    const fromIdx = PNL_DATA.findIndex(d => d.month === preset.from);
    const toIdx = PNL_DATA.findIndex(d => d.month === preset.to);
    if (fromIdx === -1) return PNL_DATA;
    return PNL_DATA.slice(fromIdx, toIdx === -1 ? undefined : toIdx + 1);
  }, [selectedPreset]);

  const data = useMemo(() => aggregateData(rawData, cadence), [rawData, cadence]);

  const historicalData = data.filter(d => !d.isProjected);
  const projectedData = data.filter(d => d.isProjected);
  const totalRev = historicalData.reduce((s, d) => s + d.revenue, 0);
  const totalExp = historicalData.reduce((s, d) => s + d.cogs + d.opex, 0);
  const totalNet = historicalData.reduce((s, d) => s + d.net, 0);
  const totalReimb = historicalData.reduce((s, d) => s + d.reimbursements, 0);
  const avgMargin = historicalData.length > 0 ? Math.round(totalNet / totalRev * 100) : 0;

  const useLineChart = cadence === 'Monthly' && viewMode === 'Total';
  const todayMarker = historicalData[historicalData.length - 1]?.month;

  // Custom dot that renders projected points differently
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload?.isProjected) return null;
    return <circle cx={cx} cy={cy} r={2} fill="#6366f1" fillOpacity={0.5} stroke="none" />;
  };

  return (
    <div className="panel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <h2 className="text-base font-bold text-foreground">P&L</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Date range presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Period</span>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {DATE_PRESETS.map(p => (
                <button key={p.label} onClick={() => setSelectedPreset(p.label)} className={cn(
                  "text-[11px] font-semibold px-2.5 py-0.5 rounded-md transition-all whitespace-nowrap",
                  selectedPreset === p.label ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{p.label}</button>
              ))}
            </div>
          </div>
          {/* Cadence */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">By</span>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {CADENCES.map(c => (
                <button key={c} onClick={() => setCadence(c)} className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all",
                  cadence === c ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{c}</button>
              ))}
            </div>
          </div>
          <button
            onClick={onTableView}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            <Table2 className="w-3 h-3" />
            Table
          </button>
        </div>
      </div>

      {/* View mode tabs + legend */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <div className="flex items-center gap-1">
          {VIEW_MODES.map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              viewMode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>{v}</button>
          ))}
        </div>
        {/* Projection legend */}
        {projectedData.length > 0 && (
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-foreground/40" />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-indigo-400 border-dashed" style={{ borderTop: '2px dashed #818cf8' }} />
              <span>Projected</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-5 pt-4 pb-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <pattern id="projectedPattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#f8f9ff" />
              </pattern>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={({ x, y, payload }) => {
                const isProj = data.find(d => d.month === payload.value)?.isProjected;
                return (
                  <text x={x} y={y + 12} textAnchor="middle" fontSize={10} fill={isProj ? '#818cf8' : 'hsl(220 15% 55%)'}>
                    {payload.value}{isProj ? '*' : ''}
                  </text>
                );
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => fmt.currency(v, 'USD', true)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Today reference line */}
            {todayMarker && (
              <ReferenceLine
                x={todayMarker}
                stroke="#94a3b8"
                strokeWidth={1.5}
                label={{ value: 'Today', fontSize: 9, fill: '#64748b', position: 'insideTopRight' }}
              />
            )}

            {/* Projection region background */}
            {todayMarker && projectedData.length > 0 && (
              <ReferenceLine x={projectedData[0]?.month} stroke="transparent" />
            )}

            {viewMode === 'Total' && useLineChart && (
              <>
                <Area
                  dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2}
                  dot={false}
                  strokeDasharray={undefined}
                />
                <Line dataKey="cogs" name="COGS" stroke="#ec4899" strokeWidth={1.5} dot={false}
                  strokeDasharray="4 3"
                />
                <Line dataKey="opex" name="OPEX" stroke="#f59e0b" strokeWidth={1.5} dot={false}
                  strokeDasharray="4 3"
                />
                <Line dataKey="net" name="Net Income" stroke="#10b981" strokeWidth={2} dot={false}
                  strokeDasharray={undefined}
                />
              </>
            )}

            {viewMode === 'Total' && !useLineChart && (
              <>
                <Bar dataKey="revenue" name="Revenue" radius={[3, 3, 0, 0]} opacity={0.9}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.isProjected ? '#a5b4fc' : '#6366f1'} fillOpacity={entry.isProjected ? 0.6 : 0.9} />
                  ))}
                </Bar>
                <Bar dataKey="cogs" name="COGS" radius={[3, 3, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.isProjected ? '#f9a8d4' : '#ec4899'} fillOpacity={entry.isProjected ? 0.5 : 0.7} />
                  ))}
                </Bar>
                <Bar dataKey="opex" name="OPEX" radius={[3, 3, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.isProjected ? '#fcd34d' : '#f59e0b'} fillOpacity={entry.isProjected ? 0.5 : 0.7} />
                  ))}
                </Bar>
              </>
            )}

            {viewMode === 'By Client' && CLIENTS.map((client, i) => (
              <Bar key={client.id} dataKey={d => d.byClient?.[client.id] || 0} name={client.name}
                fill={CLIENT_COLORS[i]} radius={[3, 3, 0, 0]} opacity={0.85} stackId="client" />
            ))}

            {viewMode === 'By Category' && CATEGORIES.slice(0, 6).map((cat, i) => (
              <Bar key={cat.id} dataKey={d => d.byCategory?.[cat.id] || 0} name={cat.name}
                fill={CAT_COLORS[i]} radius={i === 0 ? [3, 3, 0, 0] : [0, 0, 0, 0]} opacity={0.85} stackId="cat" />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Projected note */}
      {projectedData.length > 0 && (
        <div className="px-5 pb-1">
          <p className="text-[10px] text-indigo-400 italic">* Projected months shown in lighter color / asterisk</p>
        </div>
      )}

      {/* Summary stats */}
      <div className="px-5 pb-5">
        <SummaryTable
          totalRev={totalRev}
          totalExp={totalExp}
          totalNet={totalNet}
          totalReimb={totalReimb}
          avgMargin={avgMargin}
          onCategoryClick={setBudgetCategory}
        />
      </div>

      {budgetCategory && (
        <CategoryBudgetModal category={budgetCategory} onClose={() => setBudgetCategory(null)} />
      )}
    </div>
  );
}

function SummaryTable({ totalRev, totalExp, totalNet, totalReimb, avgMargin, onCategoryClick }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const expPct = Math.round((totalExp / totalRev) * 100);

  const cogsSub = [
    { label: 'Travel', value: Math.round(totalExp * 0.15), catId: 'travel' },
    { label: 'Design', value: Math.round(totalExp * 0.10), catId: 'design' },
    { label: 'Subcontractors', value: Math.round(totalExp * 0.20), catId: 'subcontractors' },
    { label: 'Meals', value: Math.round(totalExp * 0.05), catId: 'meals' },
  ];
  const opexSub = [
    { label: 'Salary', value: Math.round(totalExp * 0.22), catId: 'salary' },
    { label: 'Software & Tools', value: Math.round(totalExp * 0.06), catId: 'software' },
    { label: 'Marketing', value: Math.round(totalExp * 0.07), catId: 'marketing' },
    { label: 'Legal & Accounting', value: Math.round(totalExp * 0.05), catId: 'legal' },
    { label: 'Office & Admin', value: Math.round(totalExp * 0.05), catId: 'office' },
  ];
  const cogsTotal = cogsSub.reduce((s, i) => s + i.value, 0);
  const opexTotal = opexSub.reduce((s, i) => s + i.value, 0);

  return (
    <div className="border-t border-border/60 pt-4 mt-2 space-y-0">
      {/* Revenue row */}
      <SummaryRow
        label="Total Revenue" sublabel="Incl. reimbursements"
        value={totalRev} positive expanded={expandedRow === 'rev'}
        onToggle={() => setExpandedRow(expandedRow === 'rev' ? null : 'rev')}
        details={[
          { label: 'Client Retainers', value: Math.round(totalRev * 0.85) },
          { label: 'Project Fees', value: Math.round(totalRev * 0.12) },
          { label: 'Misc Income', value: Math.round(totalRev * 0.03) },
        ]}
      />

      {/* Expenses row — pct on right */}
      <div>
        <button
          onClick={() => setExpandedRow(expandedRow === 'exp' ? null : 'exp')}
          className={cn("w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors text-left hover:bg-muted/60", expandedRow === 'exp' && "bg-muted/60")}
        >
          <span className="text-sm font-medium text-foreground">Expenses</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-mono">{expPct}% of rev</span>
            <span className="text-sm font-mono font-semibold text-negative">{fmt.currency(-totalExp, 'USD', true)}</span>
            {expandedRow === 'exp' ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </button>

        {expandedRow === 'exp' && (
          <div className="mx-3 mb-2 border border-border/50 rounded-lg overflow-hidden animate-slide-up">
            {/* COGS section */}
            <div className="bg-muted/40 px-3 py-2 flex justify-between items-center border-b border-border/30">
              <span className="text-xs font-semibold text-foreground">COGS</span>
              <span className="text-xs font-mono font-semibold text-foreground">{fmt.currency(cogsTotal, 'USD', true)}</span>
            </div>
            {cogsSub.map((item, i) => (
              <button
                key={item.label}
                onClick={() => onCategoryClick(item)}
                className={cn("w-full flex justify-between items-center px-4 py-1.5 text-xs hover:bg-primary/5 transition-colors group", i % 2 === 0 ? "bg-muted/10" : "bg-background")}
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{fmt.currency(item.value, 'USD', true)}</span>
                  <span className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Set budget →</span>
                </div>
              </button>
            ))}

            {/* OPEX section */}
            <div className="bg-muted/40 px-3 py-2 flex justify-between items-center border-t border-b border-border/30">
              <span className="text-xs font-semibold text-foreground">OPEX</span>
              <span className="text-xs font-mono font-semibold text-foreground">{fmt.currency(opexTotal, 'USD', true)}</span>
            </div>
            {opexSub.map((item, i) => (
              <button
                key={item.label}
                onClick={() => onCategoryClick(item)}
                className={cn("w-full flex justify-between items-center px-4 py-1.5 text-xs hover:bg-primary/5 transition-colors group", i % 2 === 0 ? "bg-muted/10" : "bg-background")}
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{fmt.currency(item.value, 'USD', true)}</span>
                  <span className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Set budget →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reimbursements */}
      <SummaryRow
        label="Reimbursements" value={totalReimb} positive
        expanded={expandedRow === 'reimb'}
        onToggle={() => setExpandedRow(expandedRow === 'reimb' ? null : 'reimb')}
        details={[
          { label: 'Travel Reimbursements', value: Math.round(totalReimb * 0.65) },
          { label: 'Misc Reimbursements', value: Math.round(totalReimb * 0.35) },
        ]}
      />

      {/* Net Income */}
      <div className="flex items-center justify-between py-2.5 px-3">
        <span className="text-sm font-bold text-foreground">Net Income</span>
        <span className={cn("text-sm font-bold font-mono", totalNet >= 0 ? "text-positive" : "text-negative")}>{fmt.currency(totalNet, 'USD', true)}</span>
      </div>
      <div className="flex items-center justify-between py-2.5 px-3">
        <span className="text-sm font-bold text-foreground">NI Margin</span>
        <span className={cn("text-sm font-bold font-mono", avgMargin >= 0 ? "text-positive" : "text-negative")}>{avgMargin}%</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, sublabel, value, positive, expanded, onToggle, details, bold }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn("w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors text-left hover:bg-muted/60", expanded && "bg-muted/60")}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", bold ? "font-bold" : "font-medium")}>{label}</span>
          {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-mono font-semibold", positive ? "text-positive" : "text-negative")}>
            {fmt.currency(value, 'USD', true)}
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      {expanded && details && (
        <div className="mx-3 mb-2 border border-border/50 rounded-lg overflow-hidden animate-slide-up">
          {details.map((d, i) => (
            <div key={i} className={cn("flex justify-between items-center px-3 py-1.5 text-xs", i % 2 === 0 ? "bg-muted/30" : "bg-background")}>
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-mono">{fmt.currency(d.value, 'USD', true)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}