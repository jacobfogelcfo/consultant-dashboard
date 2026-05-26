import { PnLChart } from "./PnLChart";
import { CashProjection } from "./CashProjection";

export function CenterPanel({ onPnLTableView, onCashTableView }) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <PnLChart onTableView={onPnLTableView} />
      <CashProjection onTableView={onCashTableView} />
    </div>
  );
}