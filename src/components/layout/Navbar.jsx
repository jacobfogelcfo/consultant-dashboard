import { BarChart3, Bell, Settings, User } from "lucide-react";

export function Navbar() {
  return (
    <nav className="h-12 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-foreground">Consulting Dashboard</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-medium text-muted-foreground">Live Data</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </nav>
  );
}