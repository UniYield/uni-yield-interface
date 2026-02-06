import { useQuery } from "@tanstack/react-query";
import { fetchUsdcYieldsEthereum } from "@/lib/defillama";

export const defiLlamaQueryKeys = {
  all: ["defillama"] as const,
  usdcYields: () => [...defiLlamaQueryKeys.all, "usdc-yields"] as const,
};

/** React Query hook for DefiLlama USDC yields (Aave, Morpho, Compound on Ethereum). */
export function useDefiLlamaYields() {
  return useQuery({
    queryKey: defiLlamaQueryKeys.usdcYields(),
    queryFn: fetchUsdcYieldsEthereum,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
