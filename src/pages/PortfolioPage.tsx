import { MetricCard } from "@/components/MetricCard";
import { AllocationBar } from "@/components/AllocationBar";
import { ActivityTable } from "@/components/ActivityTable";

const allocations = [
  { protocol: "Aave", percentage: 0 },
  { protocol: "Morpho", percentage: 100 },
  { protocol: "Compound", percentage: 0 },
];

const activities = [
  {
    date: "Feb 1, 2026",
    amount: "5,000 USDC",
    shares: "4,993.35 uyUSDC",
    status: "completed" as const,
  },
  {
    date: "Jan 28, 2026",
    amount: "2,500 USDC",
    shares: "2,496.73 uyUSDC",
    status: "completed" as const,
  },
  {
    date: "Jan 15, 2026",
    amount: "10,000 USDC",
    shares: "9,987.00 uyUSDC",
    status: "completed" as const,
  },
];

export default function PortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Portfolio
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your vault position and activity.
        </p>
      </div>

      {/* Overview Metrics */}
      <section className="mb-8">
        <h2 className="infra-label mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Vault Shares" value="17,477.08" subValue="uyUSDC" />
          <MetricCard
            label="USDC Value"
            value="$17,523.42"
            subValue="+$46.34 earned"
          />
          <MetricCard label="Current APY" value="3.88%" highlight />
          <MetricCard label="Active Protocol" value="Morpho" />
        </div>
      </section>

      {/* Allocation */}
      <section className="mb-8">
        <h2 className="infra-label mb-4">Allocation</h2>
        <div className="infra-card p-6">
          <AllocationBar allocations={allocations} />
          <p className="mt-4 text-xs text-muted-foreground">
            Allocation updates automatically based on yield conditions.
          </p>
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="infra-label mb-4">Activity</h2>
        <div className="infra-card p-6">
          <ActivityTable activities={activities} />
        </div>
      </section>
    </div>
  );
}
