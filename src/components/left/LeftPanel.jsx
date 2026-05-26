import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClientCard } from "./ClientCard";
import { SpendCategoryCard } from "./SpendCategoryCard";
import { CLIENTS, SPEND_CATEGORIES_DATA } from "@/data/seedData";
import { Plus, Table2 } from "lucide-react";
import { ClientsTableModal } from "@/components/modals/ClientsTableModal";
import { CategoriesTableModal } from "@/components/modals/CategoriesTableModal";
import { AddClientModal } from "@/components/modals/AddClientModal";

function PanelHeader({ title, mode, onModeChange, onTableView, onAdd }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-1.5">
        {mode && (
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {['M', 'Y'].map(m => (
              <button key={m} onClick={() => onModeChange(m)} className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all",
                mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>{m}</button>
            ))}
          </div>
        )}
        <button onClick={onTableView} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Open table view">
          <Table2 className="w-3.5 h-3.5" />
        </button>
        {onAdd && (
          <button onClick={onAdd} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LeftPanel({ onClientClick, onTableView }) {
  const [clientMode, setClientMode] = useState('M');
  const [categoryMode, setCategoryMode] = useState('M');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showClientsTable, setShowClientsTable] = useState(false);
  const [showCatsTable, setShowCatsTable] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState(CLIENTS);

  const filteredCategories = categoryFilter === 'ALL'
    ? SPEND_CATEGORIES_DATA
    : SPEND_CATEGORIES_DATA.filter(c => c.type === categoryFilter);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Clients Panel */}
      <div className="flex flex-col min-h-0 flex-1 panel-card overflow-hidden">
        <PanelHeader
          title="Clients"
          mode={clientMode}
          onModeChange={setClientMode}
          onTableView={() => setShowClientsTable(true)}
          onAdd={() => setShowAddClient(true)}
        />
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} mode={clientMode} onClick={onClientClick} />
          ))}
        </div>
      </div>

      {/* Spend Categories Panel */}
      <div className="flex flex-col min-h-0 flex-1 panel-card overflow-hidden">
        <PanelHeader
          title="Spend Categories"
          mode={categoryMode}
          onModeChange={setCategoryMode}
          onTableView={() => setShowCatsTable(true)}
        />
        <div className="px-3 py-2 border-b border-border/40 flex gap-1">
          {['ALL', 'COGS', 'OPEX'].map(f => (
            <button key={f} onClick={() => setCategoryFilter(f)} className={cn(
              "text-[10px] font-semibold px-2 py-1 rounded-md transition-all",
              categoryFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>{f}</button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {filteredCategories.map(cat => (
            <SpendCategoryCard key={cat.id} category={cat} mode={categoryMode} />
          ))}
        </div>
      </div>

      {showClientsTable && (
        <ClientsTableModal
          onClose={() => setShowClientsTable(false)}
          onClientClick={(c) => { onClientClick(c); setShowClientsTable(false); }}
        />
      )}
      {showCatsTable && <CategoriesTableModal onClose={() => setShowCatsTable(false)} />}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdd={(c) => setClients(prev => [...prev, c])}
        />
      )}
    </div>
  );
}