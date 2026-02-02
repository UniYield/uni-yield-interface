interface ActivityTableProps {
  activities: {
    date: string;
    amount: string;
    shares: string;
    status: "completed" | "pending";
  }[];
}

export function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amount
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Shares Minted
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activities.map((activity, index) => (
            <tr key={index} className="hover-lift">
              <td className="py-3 text-foreground">{activity.date}</td>
              <td className="py-3 text-right tabular-nums text-foreground">
                {activity.amount}
              </td>
              <td className="py-3 text-right tabular-nums text-foreground">
                {activity.shares}
              </td>
              <td className="py-3 text-right">
                <span
                  className={
                    activity.status === "completed"
                      ? "status-active"
                      : "status-pending"
                  }
                >
                  {activity.status === "completed" ? "Completed" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
