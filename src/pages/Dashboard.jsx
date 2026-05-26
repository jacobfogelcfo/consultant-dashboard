import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LeftPanel } from "@/components/left/LeftPanel";
import { CenterPanel } from "@/components/center/CenterPanel";
import { RightPanel } from "@/components/right/RightPanel";
import { ClientSidePeek } from "@/components/modals/ClientSidePeek";
import { PnLTableModal } from "@/components/modals/PnLTableModal";

export default function Dashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPnLTable, setShowPnLTable] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-inter">
      <Navbar />

      {/* Three-panel layout */}
      <div className="flex flex-1 gap-3 p-3 overflow-hidden min-h-0">
        {/* LEFT: Fixed, internally scrollable */}
        <div className="w-64 flex-shrink-0 flex flex-col min-h-0">
          <LeftPanel
            onClientClick={setSelectedClient}
            onTableView={(type) => {
              if (type === 'clients' && selectedClient) setSelectedClient(selectedClient);
            }}
          />
        </div>

        {/* CENTER: Main scrollable panel */}
        <div className="flex-1 overflow-y-auto min-h-0 min-w-0">
          <CenterPanel
            onPnLTableView={() => setShowPnLTable(true)}
            onCashTableView={() => {}}
          />
        </div>

        {/* RIGHT: Fixed, internally scrollable */}
        <div className="w-72 flex-shrink-0 flex flex-col min-h-0">
          <RightPanel />
        </div>
      </div>

      {/* Modals / Side peeks */}
      {selectedClient && (
        <ClientSidePeek
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {showPnLTable && (
        <PnLTableModal onClose={() => setShowPnLTable(false)} />
      )}
    </div>
  );
}