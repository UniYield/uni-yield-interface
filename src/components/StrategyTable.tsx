interface StrategyTableProps {
  strategies: {
    protocol: string;
    apy: string;
    status: "active" | "available";
  }[];
}

export function StrategyTable({ strategies }: StrategyTableProps) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
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
          {strategies.map((strategy) => (
            <tr key={strategy.protocol} className="hover-lift">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
