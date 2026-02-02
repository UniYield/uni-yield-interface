interface AllocationBarProps {
  allocations: {
    protocol: string;
    percentage: number;
  }[];
}

export function AllocationBar({ allocations }: AllocationBarProps) {
  return (
    <div className="space-y-3">
      {allocations.map((allocation) => (
        <div key={allocation.protocol} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">{allocation.protocol}</span>
            <span className="text-muted-foreground tabular-nums">
              {allocation.percentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allocation.percentage > 0 ? "bg-primary" : "bg-transparent"
              }`}
              style={{ width: `${allocation.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
