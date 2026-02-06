/**
 * DefiLlama Yields API client for USDC lending rates on Ethereum.
 * Fetches real-time APY for Aave V3, Morpho V1, Compound V3.
 * API: https://yields.llama.fi/pools
 */

const DEFILLAMA_POOLS_URL = "https://yields.llama.fi/pools";

export interface DefiLlamaPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd?: number;
  apy?: number;
  apyBase?: number;
  apyReward?: number;
}

interface DefiLlamaPoolsResponse {
  data?: DefiLlamaPool[];
}

const ETHEREUM_CHAINS = ["Ethereum", "ethereum"];

/** Exact USDC pools for Aave V3 and Compound V3. */
function isExactUsdc(symbol: string): boolean {
  const s = (symbol ?? "").trim().toUpperCase();
  return s === "USDC" || s === "USDC.E" || s === "USDBC";
}

/** Morpho meta-vaults that optimize USDC (symbol contains USDC). */
function isMorphoUsdcRelated(symbol: string): boolean {
  const s = (symbol ?? "").toUpperCase();
  return s.includes("USDC") && s.length <= 20;
}

function matchesProtocol(project: string): "Aave" | "Morpho" | "Compound" | null {
  const lower = (project ?? "").toLowerCase();
  if (lower === "aave-v3") return "Aave";
  if (lower === "morpho-v1" || lower === "morpho-blue") return "Morpho";
  if (lower === "compound-v3") return "Compound";
  return null;
}

/**
 * Fetch USDC lending APY for Aave V3, Morpho V1, Compound V3 on Ethereum.
 * Returns map of protocol name -> APY string (e.g. "3.85%").
 * Uses DefiLlama yields API: https://yields.llama.fi/pools
 */
export async function fetchUsdcYieldsEthereum(): Promise<Record<string, string>> {
  const res = await fetch(DEFILLAMA_POOLS_URL);
  if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);
  const json = (await res.json()) as DefiLlamaPoolsResponse;
  const pools = json.data ?? [];

  const result: Record<string, { apy: number; tvlUsd: number }> = {};

  for (const p of pools) {
    const chain = p.chain ?? "";
    if (!ETHEREUM_CHAINS.includes(chain)) continue;

    const protocol = matchesProtocol(p.project ?? "");
    if (!protocol) continue;

    const symbol = p.symbol ?? "";
    const isAaveOrCompound = protocol !== "Morpho" && isExactUsdc(symbol);
    const isMorpho = protocol === "Morpho" && isMorphoUsdcRelated(symbol);
    if (!isAaveOrCompound && !isMorpho) continue;

    const apy = typeof p.apy === "number" ? p.apy : (p.apyBase ?? 0);
    const tvlUsd = typeof p.tvlUsd === "number" ? p.tvlUsd : 0;
    if (apy <= 0 && protocol === "Morpho") continue; // skip zero-APY Morpho vaults

    const existing = result[protocol];
    if (!existing || tvlUsd > existing.tvlUsd) {
      result[protocol] = { apy, tvlUsd };
    }
  }

  const out: Record<string, string> = {};
  for (const [protocol, { apy }] of Object.entries(result)) {
    out[protocol] = `${apy.toFixed(2)}%`;
  }
  return out;
}
