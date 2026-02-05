/**
 * Route ranking and fee breakdown for LI.FI routes UI.
 * Does not change execution logic.
 */
import type { Route } from "@lifi/types";

export interface RouteRankings {
  /** Index of route with lowest execution time */
  fastestIndex: number;
  /** Index of route with highest toAmount (best net receive) */
  cheapestIndex: number;
  /** Index of route with fewest steps */
  simplestIndex: number;
  /** Index to highlight as "recommended" (first by default, or from route.tags) */
  recommendedIndex: number;
}

function getExecutionDuration(route: Route): number {
  const firstStep = route.steps[0] as { estimate?: { executionDuration?: number } } | undefined;
  const sec = firstStep?.estimate?.executionDuration;
  return typeof sec === "number" ? sec : 0;
}

/**
 * Compute which route is fastest, cheapest (best receive), and simplest (fewest steps).
 */
export function computeRouteRankings(routes: Route[]): RouteRankings {
  if (routes.length === 0) {
    return { fastestIndex: 0, cheapestIndex: 0, simplestIndex: 0, recommendedIndex: 0 };
  }
  let fastestIndex = 0;
  let cheapestIndex = 0;
  let simplestIndex = 0;
  let minTime = getExecutionDuration(routes[0]);
  let maxReceive = BigInt(routes[0].toAmount);
  let minSteps = routes[0].steps.length;

  for (let i = 1; i < routes.length; i++) {
    const t = getExecutionDuration(routes[i]);
    if (t < minTime) {
      minTime = t;
      fastestIndex = i;
    }
    const recv = BigInt(routes[i].toAmount);
    if (recv > maxReceive) {
      maxReceive = recv;
      cheapestIndex = i;
    }
    if (routes[i].steps.length < minSteps) {
      minSteps = routes[i].steps.length;
      simplestIndex = i;
    }
  }

  const recommendedIndex = routes.findIndex((r) => (r.tags as string[] | undefined)?.includes("RECOMMENDED"));
  return {
    fastestIndex,
    cheapestIndex,
    simplestIndex,
    recommendedIndex: recommendedIndex >= 0 ? recommendedIndex : cheapestIndex,
  };
}

export type RouteLabel = "Fastest" | "Cheapest" | "Simplest" | "Recommended";

/**
 * Get labels for a route at the given index.
 */
export function getRouteLabels(index: number, rankings: RouteRankings): RouteLabel[] {
  const labels: RouteLabel[] = [];
  if (index === rankings.recommendedIndex) labels.push("Recommended");
  if (index === rankings.fastestIndex) labels.push("Fastest");
  if (index === rankings.cheapestIndex) labels.push("Cheapest");
  if (index === rankings.simplestIndex) labels.push("Simplest");
  return labels;
}

export interface FeeBreakdownLine {
  label: string;
  amountUSD: string;
  type: "bridge" | "swap" | "gas" | "integrator" | "other";
}

/**
 * Build a fee breakdown from route steps. TODO: Some fee fields may not always be present; best-effort.
 */
export function getFeeBreakdown(route: Route): FeeBreakdownLine[] {
  const lines: FeeBreakdownLine[] = [];
  let totalUSD = 0;

  for (const step of route.steps) {
    const est = (step as { estimate?: { feeCosts?: Array<{ name: string; amountUSD: string }>; gasCosts?: Array<{ amountUSD: string; type: string }> } }).estimate;
    if (!est) continue;

    if (est.feeCosts) {
      for (const f of est.feeCosts) {
        const usd = parseFloat(f.amountUSD || "0");
        if (usd > 0) {
          totalUSD += usd;
          const type = f.name?.toLowerCase().includes("bridge") ? "bridge" : f.name?.toLowerCase().includes("swap") ? "swap" : "other";
          lines.push({ label: f.name || "Fee", amountUSD: `$${usd.toFixed(4)}`, type });
        }
      }
    }
    if (est.gasCosts) {
      for (const g of est.gasCosts) {
        const usd = parseFloat((g as { amountUSD?: string }).amountUSD || "0");
        if (usd > 0) {
          totalUSD += usd;
          const gasType = (g as { type?: string }).type === "APPROVE" ? "Gas (approve)" : "Gas";
          lines.push({ label: gasType, amountUSD: `$${usd.toFixed(4)}`, type: "gas" });
        }
      }
    }
  }

  if (route.gasCostUSD) {
    const routeGas = parseFloat(route.gasCostUSD);
    if (routeGas > 0 && !lines.some((l) => l.type === "gas")) {
      totalUSD += routeGas;
      lines.push({ label: "Gas", amountUSD: `$${routeGas.toFixed(4)}`, type: "gas" });
    }
  }

  return lines;
}

/**
 * Total fees for display (from route.gasCostUSD or sum of breakdown). TODO: LiFi may expose total fee separately.
 */
export function getTotalFeesUSD(route: Route): string {
  if (route.gasCostUSD) return `$${parseFloat(route.gasCostUSD).toFixed(4)}`;
  const breakdown = getFeeBreakdown(route);
  const total = breakdown.reduce((sum, l) => sum + parseFloat(l.amountUSD.replace("$", "")), 0);
  return total > 0 ? `$${total.toFixed(4)}` : "—";
}

/**
 * Short explanation for "Why this route?" tooltip.
 */
export function getRouteExplanation(
  index: number,
  rankings: RouteRankings,
  route: Route
): string {
  const labels = getRouteLabels(index, rankings);
  if (labels.includes("Recommended")) return "Best net received amount.";
  if (labels.includes("Cheapest")) return "Highest amount you receive after fees.";
  if (labels.includes("Fastest")) return "Fastest estimated execution.";
  if (labels.includes("Simplest")) return "Fewest steps (simplest path).";
  return "Alternative route.";
}

export interface ApprovalInfo {
  required: boolean;
  tokenSymbol: string;
  spenderAddress: string;
  amount: string;
}

/**
 * Derive approval requirement from first step that has approvalAddress and is not skipApproval.
 */
export function getApprovalInfo(route: Route): ApprovalInfo {
  const defaultInfo: ApprovalInfo = { required: false, tokenSymbol: "USDC", spenderAddress: "", amount: "" };
  const firstStep = route.steps[0] as {
    estimate?: { approvalAddress?: string; fromAmount?: string; skipApproval?: boolean };
    action?: { fromToken?: { symbol?: string } };
  } | undefined;
  if (!firstStep?.estimate?.approvalAddress) return defaultInfo;
  if (firstStep.estimate.skipApproval) return defaultInfo;
  const addr = firstStep.estimate.approvalAddress;
  const short = addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
  return {
    required: true,
    tokenSymbol: firstStep.action?.fromToken?.symbol ?? "USDC",
    spenderAddress: short,
    amount: firstStep.estimate.fromAmount ?? "",
  };
}

export interface StepDetail {
  type: string;
  fromChainId: number;
  toChainId: number;
  tokenIn: string;
  tokenOut: string;
  toolName: string;
  toolKey: string;
  executionDurationSec?: number;
}

/**
 * Flatten step details for expandable UI. Uses top-level steps (LiFiStep); includedSteps could be used for more granularity.
 */
export function getStepDetails(route: Route): StepDetail[] {
  return route.steps.map((s) => {
    const step = s as {
      type: string;
      toolDetails?: { name: string; key: string };
      tool?: string;
      action?: { fromChainId: number; toChainId: number; fromToken?: { symbol?: string }; toToken?: { symbol?: string } };
      estimate?: { executionDuration?: number };
    };
    const action = step.action;
    return {
      type: step.type ?? "unknown",
      fromChainId: action?.fromChainId ?? 0,
      toChainId: action?.toChainId ?? 0,
      tokenIn: action?.fromToken?.symbol ?? "—",
      tokenOut: action?.toToken?.symbol ?? "—",
      toolName: step.toolDetails?.name ?? step.tool ?? "—",
      toolKey: step.toolDetails?.key ?? step.tool ?? "",
      executionDurationSec: step.estimate?.executionDuration,
    };
  });
}
