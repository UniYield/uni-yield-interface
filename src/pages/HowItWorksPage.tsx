import { ArrowRight, Check } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Deposit from any chain",
    description: "USDC is routed cross-chain using LI.FI.",
  },
  {
    number: "2",
    title: "Assets arrive on Ethereum",
    description: "Deposits are settled into the UniYield vault.",
  },
  {
    number: "3",
    title: "Automatic optimization",
    description: "Funds are allocated to the best yield source.",
  },
  {
    number: "4",
    title: "Single position",
    description: "You hold one ERC-4626 vault share token.",
  },
];

const comparisonData = [
  {
    feature: "Position",
    direct: "Multiple tokens",
    uniyield: "One share",
  },
  {
    feature: "Yield management",
    direct: "Manual",
    uniyield: "Automatic",
  },
  {
    feature: "Cross-chain UX",
    direct: "Fragmented",
    uniyield: "Unified",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          How it works
        </h1>
        <p className="mt-2 text-muted-foreground">
          A unified interface for cross-chain yield optimization.
        </p>
      </div>

      {/* Steps */}
      <section className="mb-16">
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-12 w-px h-8 bg-border" />
              )}
              
              <div className="flex gap-6 py-4">
                {/* Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <div className="pt-0.5">
                  <h3 className="text-base font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="infra-label mb-4">Comparison</h2>
        <div className="infra-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Direct Deposit
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  UniYield
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonData.map((row) => (
                <tr key={row.feature} className="hover-lift">
                  <td className="py-3 px-4 font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {row.direct}
                  </td>
                  <td className="py-3 px-4 text-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    {row.uniyield}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="infra-label mb-4">Technical Details</h2>
        <div className="infra-card p-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vault address</span>
            <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
              0x1234...5678
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Standard</span>
            <span className="text-foreground">ERC-4626 compliant</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supported protocols</span>
            <span className="text-foreground">Aave, Morpho, Compound</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rebalance frequency</span>
            <span className="text-foreground">When APY delta exceeds 0.25%</span>
          </div>
          <div className="pt-4 border-t border-border flex gap-4">
            <a
              href="#"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              View on Etherscan <ArrowRight className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Audit report <ArrowRight className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Documentation <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
