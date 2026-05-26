import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', industry: '', paymentAmount: '', paymentCurrency: 'USD',
    paymentCadence: 'monthly', paymentCadenceDetail: '', description: '',
    monthlyBudget: '', services: [''],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#06b6d4','#ef4444','#84cc16'];
  const [colorIdx, setColorIdx] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      id: `c-${Date.now()}`,
      color: COLORS[colorIdx],
      paymentAmount: Number(form.paymentAmount),
      monthlyBudget: Number(form.monthlyBudget),
      yearlyBudget: Number(form.monthlyBudget) * 12,
      services: form.services.filter(Boolean),
      status: 'active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold">Add Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Client Name</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Industry</label>
              <input value={form.industry} onChange={e => set('industry', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {COLORS.map((c, i) => (
                  <button key={c} type="button" onClick={() => setColorIdx(i)}
                    className={cn("w-6 h-6 rounded-full transition-all", colorIdx === i && "ring-2 ring-offset-1 ring-primary")}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Amount</label>
              <input required type="number" value={form.paymentAmount} onChange={e => set('paymentAmount', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <select value={form.paymentCurrency} onChange={e => set('paymentCurrency', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="USD">USD</option>
                <option value="ILS">ILS</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Cadence</label>
              <select value={form.paymentCadence} onChange={e => set('paymentCadence', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Monthly Budget</label>
              <input required type="number" value={form.monthlyBudget} onChange={e => set('monthlyBudget', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description / Scope</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}