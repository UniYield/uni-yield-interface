interface StrategyRow {
  protocol: string;
  apy: string;
  status: "active" | "available";
}

interface StrategyTableProps {
  strategies: StrategyRow[];
  /** When set, rows are selectable and this is the selected protocol. */
  selectedProtocol?: string | null;
  onSelectProtocol?: (protocol: string) => void;
}

export function StrategyTable({
  strategies,
  selectedProtocol = null,
  onSelectProtocol,
}: StrategyTableProps) {
  const isSelectable = onSelectProtocol != null;

  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {isSelectable && (
              <th className="pb-3 w-10 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="sr-only">Choose</span>
              </th>
            )}
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Protocol
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current APY
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {strategies.map((strategy) => {
            const isSelected = selectedProtocol === strategy.protocol;
            const row = (
              <tr
                key={strategy.protocol}
                className={
                  isSelectable
                    ? `cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-muted/50" : ""}`
                    : "hover-lift"
                }
                onClick={
                  isSelectable
                    ? () => onSelectProtocol(strategy.protocol)
                    : undefined
                }
                role={isSelectable ? "button" : undefined}
              >
                {isSelectable && (
                  <td className="py-3">
                    <input
                      type="radio"
                      name="strategy"
                      checked={isSelected}
                      onChange={() => onSelectProtocol(strategy.protocol)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 accent-primary"
                      aria-label={`Select ${strategy.protocol}`}
                    />
                  </td>
                )}
                <td className="py-3 font-medium text-foreground">
                  {strategy.protocol}
                </td>
                <td className="py-3 text-right tabular-nums text-foreground">
                  {strategy.apy}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={
                      strategy.status === "active"
                        ? "status-active"
                        : "status-available"
                    }
                  >
                    {strategy.status === "active" ? "Active" : "Available"}
                  </span>
                </td>
              </tr>
            );
            return row;
          })}
        </tbody>
      </table>
    </div>
  );
}
