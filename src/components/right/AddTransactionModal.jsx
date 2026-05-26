import { useState } from "react";
import { X, Repeat } from "lucide-react";
import { CLIENTS, CATEGORIES } from "@/data/seedData";
import { cn } from "@/lib/utils";

export function AddTransactionModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    type: 'expense',
    description: '',
    vendor: '',
    amount: '',
    currency: 'USD',
    category: '',
    clientId: '',
    isCC: false,
    ccAccount: '',
    bank: '',
    status: 'pending',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    recurring: false,
    recurringFreq: 'monthly',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    onAdd({
      ...form,
      amount: form.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Add Transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Type toggle */}
          <div className="flex gap-2">
            {['income', 'expense'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all",
                  form.type === t
                    ? t === 'income' ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-600 border border-red-300"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <input
                required
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Client meeting travel"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <select
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="USD">USD ($)</option>
                <option value="ILS">ILS (₪)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Vendor / Source</label>
              <input
                value={form.vendor}
                onChange={e => set('vendor', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. El Al Airlines"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Client</label>
              <select
                value={form.clientId}
                onChange={e => set('clientId', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">General / No client</option>
                {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => set('isCC', false)}
                  className={cn("flex-1 py-2 text-xs rounded-lg border transition-all", !form.isCC ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                >
                  Bank
                </button>
                <button
                  type="button"
                  onClick={() => set('isCC', true)}
                  className={cn("flex-1 py-2 text-xs rounded-lg border transition-all", form.isCC ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                >
                  Credit Card
                </button>
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60">
            <Repeat className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Recurring transaction</p>
              <p className="text-[10px] text-muted-foreground">Will generate future expected entries</p>
            </div>
            <button
              type="button"
              onClick={() => set('recurring', !form.recurring)}
              className={cn(
                "w-8 h-4.5 rounded-full transition-all relative",
                form.recurring ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <div className={cn(
                "w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                form.recurring ? "left-4" : "left-0.5"
              )} />
            </button>
          </div>

          {form.recurring && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Frequency</label>
              <select
                value={form.recurringFreq}
                onChange={e => set('recurringFreq', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}