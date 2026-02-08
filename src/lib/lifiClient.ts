/**
 * LiFi client helpers: bridge-to-self and vault deposit with contract calls.
 *
 * Flow: Bridge USDC to LiFi Executor on Base, then call vault.deposit(assets, receiver).
 * The Executor holds bridged USDC, approves vault, and deposits.
 */
import {
  getQuote,
  getContractCallsQuote,
  getRoutes,
  getStatus,
  convertQuoteToRoute,
} from "@lifi/sdk";
import type {
  ContractCall,
  RoutesRequest,
  RoutesResponse,
  StatusResponse,
} from "@lifi/types";
import type { Route } from "@lifi/types";
import { encodeFunctionData, type Address } from "viem";
import { USDC_BY_CHAIN_ID } from "@/lib/chains";
import {
  UNIYIELD_VAULT_BASE,
  USDC_BY_CHAIN,
  BASE_CHAIN_ID,
} from "@/config/uniyield";
import uniyieldVaultAbi from "@/abis/uniyieldVaultUI.abi.json";

const VAULT_DEPOSIT_GAS = "200000";

const vaultAbi = uniyieldVaultAbi as readonly unknown[];

/** Encode calldata for vault.deposit(assets, receiver) */
function encodeVaultDepositCalldata(
  assets: bigint,
  receiver: Address
): `0x${string}` {
  return encodeFunctionData({
    abi: vaultAbi,
    functionName: "deposit",
    args: [assets, receiver],
  });
}

export interface GetQuoteDepositToUniYieldParams {
  fromChainId: number;
  fromAmount: string;
  userAddress: string;
  /** Beneficiary of vault shares (default: userAddress) */
  receiver?: string;
}

/**
 * Get LiFi quote for cross-chain deposit into UniYield vault.
 * Uses POST /v1/quote/contractCalls (getContractCallsQuote).
 *
 * Flow: Bridge to LiFi Executor, call vault.deposit(assets, receiver).
 * toFallbackAddress = beneficiary, slippage = 0.003.
 *
 * Allowance: executeRoute runs allowance check (approve on source chain if needed).
 * Status: executeRoute tracks via getStatus until DONE/FAILED.
 */
export async function getQuoteDepositToUniYield(
  params: GetQuoteDepositToUniYieldParams
): Promise<{ route: Route; depositAmountOut: string }> {
  if (!UNIYIELD_VAULT_BASE) {
    throw new Error(
      "VITE_UNIYIELD_VAULT_ADDRESS not set. Configure the UniYield vault address on Base."
    );
  }

  const fromToken =
    USDC_BY_CHAIN[params.fromChainId] ?? USDC_BY_CHAIN_ID[params.fromChainId];
  const toToken = USDC_BY_CHAIN[BASE_CHAIN_ID];
  const beneficiary = (params.receiver ?? params.userAddress) as Address;

  if (!fromToken || !toToken) {
    throw new Error("USDC not configured for source or Base chain");
  }

  const bridgeQuote = await getQuote({
    fromChain: params.fromChainId,
    toChain: BASE_CHAIN_ID,
    fromToken,
    toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.userAddress,
  });

  const toAmount =
    bridgeQuote.estimate?.toAmount ??
    (bridgeQuote.action as { toAmount?: string })?.toAmount;
  if (!toAmount) {
    throw new Error("Could not estimate destination amount");
  }

  const depositCalldata = encodeVaultDepositCalldata(
    BigInt(toAmount),
    beneficiary
  );
  const contractCalls: ContractCall[] = [
    {
      fromAmount: toAmount,
      fromTokenAddress: toToken,
      toContractAddress: UNIYIELD_VAULT_BASE,
      toContractCallData: depositCalldata,
      toContractGasLimit: VAULT_DEPOSIT_GAS,
      toApprovalAddress: UNIYIELD_VAULT_BASE,
    },
  ];

  const contractCallQuote = await getContractCallsQuote({
    fromChain: params.fromChainId,
    toChain: BASE_CHAIN_ID,
    fromToken,
    toToken,
    fromAddress: params.userAddress,
    fromAmount: params.fromAmount,
    contractCalls,
    toFallbackAddress: beneficiary,
    denyExchanges: ["all"],
    slippage: 0.003,
  } as Parameters<typeof getContractCallsQuote>[0]);

  const route = convertQuoteToRoute(contractCallQuote);
  (route as Route & { depositAmountOut?: string }).depositAmountOut =
    toAmount;

  return {
    route,
    depositAmountOut: toAmount,
  };
}

/**
 * Creates getContractCalls hook for executeRoute.
 * Returns vault.deposit(assets, receiver) with toApprovalAddress = vault.
 */
export function createGetContractCallsForUniYield(): (
  params: import("@lifi/sdk").ContractCallParams
) => Promise<{ contractCalls: ContractCall[] }> {
  return async (params) => {
    if (!UNIYIELD_VAULT_BASE) {
      throw new Error(
        "VITE_UNIYIELD_VAULT_ADDRESS not set. Configure the UniYield vault address on Base."
      );
    }

    const toToken = USDC_BY_CHAIN[BASE_CHAIN_ID];
    if (!toToken) {
      throw new Error("USDC not configured for Base");
    }

    const beneficiary = params.fromAddress as Address;
    const expectedAmount =
      params.toAmount > 0n ? params.toAmount : params.fromAmount;
    const depositCalldata = encodeVaultDepositCalldata(
      expectedAmount,
      beneficiary
    );

    return {
      contractCalls: [
        {
          fromAmount: expectedAmount.toString(),
          fromTokenAddress: toToken,
          toContractAddress: UNIYIELD_VAULT_BASE,
          toContractCallData: depositCalldata,
          toContractGasLimit: VAULT_DEPOSIT_GAS,
          toApprovalAddress: UNIYIELD_VAULT_BASE,
        },
      ],
    };
  };
}

export interface GetQuoteBridgeToSelfParams {
  fromChainId: number;
  toChainId: number;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
}

/**
 * Fetch LiFi routes for bridging USDC from source chain to destination chain (USDC).
 */
export async function getQuoteBridgeToSelf(
  params: GetQuoteBridgeToSelfParams
): Promise<RoutesResponse> {
  const fromToken = USDC_BY_CHAIN_ID[params.fromChainId];
  const toToken = USDC_BY_CHAIN_ID[params.toChainId];
  if (!fromToken || !toToken) {
    throw new Error("USDC not configured for source or destination chain");
  }
  const request: RoutesRequest = {
    fromChainId: params.fromChainId,
    fromAmount: params.fromAmount,
    fromTokenAddress: fromToken,
    fromAddress: params.fromAddress,
    toChainId: params.toChainId,
    toTokenAddress: toToken,
    toAddress: params.toAddress,
    options: {
      order: "CHEAPEST",
      slippage: 0.03,
      allowSwitchChain: false,
    },
  };
  return getRoutes(request);
}

export interface GetStatusParams {
  txHash: string;
  bridge?: string;
  fromChain?: number | string;
  toChain?: number | string;
}

/**
 * Poll LiFi status for a transfer (e.g. after sending the first step tx).
 */
export async function getLifiStatus(
  params: GetStatusParams
): Promise<StatusResponse> {
  return getStatus({
    txHash: params.txHash,
    bridge: params.bridge,
    fromChain: params.fromChain,
    toChain: params.toChain,
  });
}
