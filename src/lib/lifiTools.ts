/**
 * LI.FI tools registry (bridges + exchanges). Cached client-side for route UI.
 */
import { getTools } from "@lifi/sdk";
import type { ToolsResponse } from "@lifi/types";

export interface ToolInfo {
  key: string;
  name: string;
  logoURI: string;
}

let cached: { bridges: Map<string, ToolInfo>; exchanges: Map<string, ToolInfo> } | null = null;

/**
 * Fetch LI.FI tools (bridges + exchanges) and cache. Safe to call multiple times.
 */
export async function fetchLifiTools(): Promise<{ bridges: Map<string, ToolInfo>; exchanges: Map<string, ToolInfo> }> {
  if (cached) return cached;
  const res: ToolsResponse = await getTools();
  const bridges = new Map<string, ToolInfo>();
  const exchanges = new Map<string, ToolInfo>();
  for (const b of res.bridges ?? []) {
    bridges.set(b.key, { key: b.key, name: b.name, logoURI: b.logoURI });
  }
  for (const e of res.exchanges ?? []) {
    exchanges.set(e.key, { key: e.key, name: e.name, logoURI: e.logoURI });
  }
  cached = { bridges, exchanges };
  return cached;
}

/**
 * Get tool metadata by key (bridge or exchange). Returns undefined if not found.
 */
export function getToolByKey(key: string): ToolInfo | undefined {
  if (!cached) return undefined;
  return cached.bridges.get(key) ?? cached.exchanges.get(key);
}

/**
 * Clear cache (e.g. for testing). Normally not needed.
 */
export function clearLifiToolsCache(): void {
  cached = null;
}
