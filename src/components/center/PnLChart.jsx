import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area
} from "recharts";
import { PNL_DATA, CLIENTS, CATEGORIES } from "@/data/seedData";
import { fmt } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Table2, TrendingUp, TrendingDown } from "lucide-react";

const VIEW_MODES = ['Total', 'By Client', 'By Category'];
const CADENCES = ['Monthly', 'Quarterly', 'Annual'];
const TIME_PRESETS = ['3M', '6M', '1Y', 'All'];

const CLIENT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
const CAT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
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
    const key = cadence === 'Quarterly' ? `Q${Math.floor(i / 3) + 1}` : d.month.split(' ')[1] || '25';
    if (!grouped[key]) grouped[key] = { month: key, revenue: 0, cogs: 0, opex: 0, net: 0, reimbursements: 0, isProjected: d.isProjected, byClient: {}, byCategory: {} };
    const g = grouped[key];
    g.revenue += d.revenue; g.cogs += d.cogs; g.opex += d.opex;
    g.net += d.net; g.reimbursements += d.reimbursements;
    Object.entries(d.byClient).forEach(([k, v]) => g.byClient[k] = (g.byClient[k] || 0) + v);
    Object.entries(d.byCategory).forEach(([k, v]) => g.byCategory[k] = (g.byCategory[k] || 0) + v);
  });
  return Object.values(grouped);
}

export function PnLChart({ onTableView }) {
  const [viewMode, setViewMode] = useState('Total');
  const [cadence, setCadence] = useState('Monthly');
  const [timePreset, setTimePreset] = useState('1Y');

  const sliceMap = { '3M': 3, '6M': 6, '1Y': 12, 'All': PNL_DATA.length };
  const rawSliced = PNL_DATA.slice(-(sliceMap[timePreset] + 6));
  const data = aggregateData(rawSliced, cadence);

  // Summary stats
  const historicalData = data.filter(d => !d.isProjected);
  const totalRev = historicalData.reduce((s, d) => s + d.revenue, 0);
  const totalExp = historicalData.reduce((s, d) => s + d.cogs + d.opex, 0);
  const totalNet = historicalData.reduce((s, d) => s + d.net, 0);
  const totalReimb = historicalData.reduce((s, d) => s + d.reimbursements, 0);
  const avgMargin = historicalData.length > 0 ? Math.round(totalNet / totalRev * 100) : 0;

  const useLineChart = cadence === 'Monthly' && viewMode === 'Total';

  return (
    <div className="panel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <h2 className="text-base font-bold text-foreground">P&L</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Period</span>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {TIME_PRESETS.map(p => (
                <button key={p} onClick={() => setTimePreset(p)} className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all",
                  timePreset === p ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">By</span>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {CADENCES.map(c => (
                <button key={c} onClick={() => { setCadence(c); if (c !== 'Monthly') setViewMode(v => v === 'Total' ? 'Total' : v); }} className={cn(
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

      {/* View mode tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0">
        {VIEW_MODES.map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              viewMode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-5 pt-4 pb-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 92%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => fmt.currency(v, 'USD', true)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={historicalData[historicalData.length - 1]?.month} stroke="hsl(220 15% 75%)" strokeDasharray="4 3" label={{ value: 'Today', fontSize: 9, fill: 'hsl(220 15% 55%)' }} />

            {viewMode === 'Total' && useLineChart && (
              <>
                <Area dataKey="revenue" name="Revenue" stroke="#6366f1" fill="#6366f115" strokeWidth={2} dot={false} />
                <Line dataKey="cogs" name="COGS" stroke="#ec4899" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line dataKey="opex" name="OPEX" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line dataKey="net" name="Net Income" stroke="#10b981" strokeWidth={2} dot={false} />
              </>
            )}

            {viewMode === 'Total' && !useLineChart && (
              <>
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.9} />
                <Bar dataKey="cogs" name="COGS" fill="#ec4899" radius={[3, 3, 0, 0]} opacity={0.7} />
                <Bar dataKey="opex" name="OPEX" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.7} />
              </>
            )}

            {viewMode === 'By Client' && CLIENTS.map((client, i) => (
              <Bar key={client.id} dataKey={d => d.byClient?.[client.id] || 0} name={client.name} fill={CLIENT_COLORS[i]} radius={[3, 3, 0, 0]} opacity={0.85} stackId="client" />
            ))}

            {viewMode === 'By Category' && CATEGORIES.slice(0, 6).map((cat, i) => (
              <Bar key={cat.id} dataKey={d => (d.byCategory?.[cat.id] || 0)} name={cat.name} fill={CAT_COLORS[i]} radius={i === 0 ? [3, 3, 0, 0] : [0, 0, 0, 0]} opacity={0.85} stackId="cat" />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="px-5 pb-5">
        <SummaryTable
          totalRev={totalRev}
          totalExp={totalExp}
          totalNet={totalNet}
          totalReimb={totalReimb}
          avgMargin={avgMargin}
          data={historicalData}
        />
      </div>
    </div>
  );
}

function SummaryTable({ totalRev, totalExp, totalNet, totalReimb, avgMargin, data }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const rows = [
    {
      id: 'rev',
      label: 'Total Revenue',
      sublabel: 'Incl. reimbursements',
      value: totalRev,
      positive: true,
      details: [
        { label: 'Client Retainers', value: Math.round(totalRev * 0.85) },
        { label: 'Project Fees', value: Math.round(totalRev * 0.12) },
        { label: 'Misc Income', value: Math.round(totalRev * 0.03) },
      ]
    },
    {
      id: 'exp',
      label: 'Expenses',
      pct: Math.round((totalExp / totalRev) * 100),
      value: -totalExp,
      positive: false,
      details: [
        { label: 'COGS', value: Math.round(totalExp * 0.6), sub: true },
        { label: '  Travel', value: Math.round(totalExp * 0.15), sub: true },
        { label: '  Design', value: Math.round(totalExp * 0.10), sub: true },
        { label: '  Subcontractors', value: Math.round(totalExp * 0.20), sub: true },
        { label: '  Meals', value: Math.round(totalExp * 0.05), sub: true },
        { label: 'OPEX', value: Math.round(totalExp * 0.4), sub: true },
        { label: '  Salary', value: Math.round(totalExp * 0.22), sub: true },
        { label: '  Software', value: Math.round(totalExp * 0.06), sub: true },
        { label: '  Marketing', value: Math.round(totalExp * 0.07), sub: true },
        { label: '  Legal', value: Math.round(totalExp * 0.05), sub: true },
      ]
    },
    {
      id: 'reimb',
      label: 'Reimbursements',
      value: totalReimb,
      positive: true,
      details: [
        { label: 'Travel Reimbursements', value: Math.round(totalReimb * 0.65) },
        { label: 'Misc Reimbursements', value: Math.round(totalReimb * 0.35) },
      ]
    },
    {
      id: 'net',
      label: 'Net Income',
      value: totalNet,
      positive: totalNet >= 0,
      bold: true,
    },
    {
      id: 'margin',
      label: 'NI Margin',
      value: avgMargin,
      isPercent: true,
      positive: avgMargin >= 0,
      bold: true,
    },
  ];

  return (
    <div className="border-t border-border/60 pt-4 mt-2">
      <div className="space-y-0">
        {rows.map(row => (
          <div key={row.id}>
            <button
              onClick={() => !row.bold && setExpandedRow(expandedRow === row.id ? null : row.id)}
              className={cn(
                "w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors text-left",
                !row.bold && "hover:bg-muted/60 cursor-pointer",
                row.bold && "cursor-default",
                expandedRow === row.id && "bg-muted/60"
              )}
            >
              <div className="flex items-center gap-2">
                {row.pct !== undefined && (
                  <span className="text-[10px] text-muted-foreground">{row.pct}%</span>
                )}
                <span className={cn("text-sm", row.bold ? "font-bold text-foreground" : "font-medium text-foreground")}>
                  {row.label}
                </span>
                {row.sublabel && <span className="text-[10px] text-muted-foreground">{row.sublabel}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-mono",
                  row.bold ? "font-bold" : "font-semibold",
                  row.positive ? "text-positive" : "text-negative"
                )}>
                  {row.isPercent ? `${row.value}%` : fmt.currency(row.value, 'USD', true)}
                </span>
                {!row.bold && (
                  expandedRow === row.id
                    ? <TrendingUp className="w-3.5 h-3.5 text-muted-foreground rotate-180" />
                    : <TrendingDown className="w-3.5 h-3.5 text-muted-foreground -rotate-180" />
                )}
              </div>
            </button>

            {expandedRow === row.id && row.details && (
              <div className="mx-3 mb-2 border border-border/50 rounded-lg overflow-hidden animate-slide-up">
                {row.details.map((d, i) => (
                  <div key={i} className={cn(
                    "flex justify-between items-center px-3 py-1.5 text-xs",
                    i % 2 === 0 ? "bg-muted/30" : "bg-background",
                    d.sub && "text-muted-foreground pl-5"
                  )}>
                    <span>{d.label}</span>
                    <span className="font-mono">{fmt.currency(d.value, 'USD', true)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}