import { useState, useCallback, useEffect } from "react";
import { fetchLifiTools, getToolByKey, type ToolInfo } from "@/lib/lifiTools";

export function useLifiTools(enableFetch: boolean) {
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      await fetchLifiTools();
      setReady(true);
    } catch {
      setReady(false);
    }
  }, []);

  useEffect(() => {
    if (enableFetch) load();
  }, [enableFetch, load]);

  return {
    getTool: getToolByKey,
    toolsReady: ready,
    loadTools: load,
  };
}
