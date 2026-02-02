interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

export function MetricCard({ label, value, subValue, highlight }: MetricCardProps) {
  return (
    <div className="infra-card p-4">
      <p className="infra-label mb-1">{label}</p>
      <p className={`infra-metric ${highlight ? "text-success" : ""}`}>{value}</p>
      {subValue && (
        <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}
