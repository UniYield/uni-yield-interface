/**
 * LiFi client helpers: bridge-to-self and vault deposit with contract calls.
 *
 * Deposit flow: Bridge USDC to UniYieldDepositReceiver on Base, then call
 * receiver.depositToVault(beneficiary, minSharesOut) to deposit all received USDC into the vault.
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
import { encodeFunctionData, createPublicClient, http, type Address } from "viem";
import { base } from "viem/chains";
import { USDC_BY_CHAIN_ID } from "@/lib/chains";
import {
  UNIYIELD_DEPOSIT_RECEIVER_BASE,
  USDC_BY_CHAIN,
  BASE_CHAIN_ID,
} from "@/config/uniyield";
import uniyieldDepositReceiverAbi from "@/abis/uniyieldDepositReceiver.abi.json";

const DEPOSIT_TO_VAULT_GAS = "250000";

const receiverAbi = uniyieldDepositReceiverAbi as readonly unknown[];

/** Encode calldata for receiver.depositToVault(beneficiary, minSharesOut) */
export function encodeDepositToVaultCalldata(
  beneficiary: Address,
  minSharesOut: bigint = 0n
): `0x${string}` {
  return encodeFunctionData({
    abi: receiverAbi,
    functionName: "depositToVault",
    args: [beneficiary, minSharesOut],
  });
}

export interface GetQuoteDepositToUniYieldParams {
  fromChainId: number;
  fromAmount: string;
  userAddress: string;
  /** Beneficiary of vault shares (default: userAddress) */
  receiver?: string;
}

function getBasePublicClient() {
  return createPublicClient({
    chain: base,
    transport: http(
      import.meta.env.VITE_BASE_RPC ?? "https://mainnet.base.org"
    ),
  });
}

/**
 * Validate that the receiver contract on Base is configured for USDC.
 * Throws if receiver.asset() !== USDC on Base.
 */
export async function validateReceiverHasUsdcAsset(
  receiverAddress: string,
  publicClient?: ReturnType<typeof createPublicClient>
): Promise<void> {
  const client = publicClient ?? getBasePublicClient();
  const asset = (await client.readContract({
    address: receiverAddress as Address,
    abi: receiverAbi,
    functionName: "asset",
  })) as string;
  const usdcBase = USDC_BY_CHAIN[BASE_CHAIN_ID];
  if (!usdcBase || asset.toLowerCase() !== usdcBase.toLowerCase()) {
    throw new Error(
      `UniYieldDepositReceiver asset mismatch: expected USDC (${usdcBase}), got ${asset}. Ensure receiver is configured for Base USDC.`
    );
  }
}

const erc20BalanceOfAbi = [
  {
    type: "function" as const,
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view" as const,
  },
] as const;

/**
 * Validate that the receiver holds USDC on Base before the deposit call.
 * Call this when preparing the destination tx (after bridge has delivered).
 * Throws if receiver's USDC balance is 0.
 */
export async function validateReceiverHoldsUsdc(
  receiverAddress: string
): Promise<void> {
  const usdcBase = USDC_BY_CHAIN[BASE_CHAIN_ID];
  if (!usdcBase) throw new Error("USDC not configured for Base");
  const client = getBasePublicClient();
  const balance = await client.readContract({
    address: usdcBase as Address,
    abi: erc20BalanceOfAbi,
    functionName: "balanceOf",
    args: [receiverAddress as Address],
  });
  if (balance === 0n) {
    throw new Error(
      "UniYieldDepositReceiver holds no USDC on Base. Bridge may not have delivered yet or failed. Check bridge status."
    );
  }
}

/**
 * Get LiFi quote for cross-chain deposit into UniYield vault via UniYieldDepositReceiver.
 *
 * Flow:
 * 1. Bridge USDC to the receiver contract (NOT user EOA).
 * 2. Single contract call: receiver.depositToVault(beneficiary, minSharesOut).
 *
 * No destination swap. denyExchanges: ["all"].
 */
export async function getQuoteDepositToUniYield(
  params: GetQuoteDepositToUniYieldParams
): Promise<{ route: Route; depositAmountOut: string }> {
  if (!UNIYIELD_DEPOSIT_RECEIVER_BASE) {
    throw new Error(
      "VITE_UNIYIELD_DEPOSIT_RECEIVER_ADDRESS not set. Configure the UniYieldDepositReceiver address on Base."
    );
  }

  const fromToken =
    USDC_BY_CHAIN[params.fromChainId] ?? USDC_BY_CHAIN_ID[params.fromChainId];
  const toToken = USDC_BY_CHAIN[BASE_CHAIN_ID];
  const beneficiary = (params.receiver ?? params.userAddress) as Address;

  if (!fromToken || !toToken) {
    throw new Error("USDC not configured for source or Base chain");
  }

  // Validate receiver is configured for USDC before building route
  await validateReceiverHasUsdcAsset(UNIYIELD_DEPOSIT_RECEIVER_BASE);

  // Step 1: Bridge-only quote to estimate toAmount on Base
  const bridgeQuote = await getQuote({
    fromChain: params.fromChainId,
    toChain: BASE_CHAIN_ID,
    fromToken,
    toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.userAddress,
    toAddress: UNIYIELD_DEPOSIT_RECEIVER_BASE, // Bridge recipient = receiver contract
  });

  const toAmount =
    bridgeQuote.estimate?.toAmount ?? (bridgeQuote.action as { toAmount?: string })?.toAmount;
  if (!toAmount) {
    throw new Error("Could not estimate destination amount");
  }

  // Step 2: Single contract call - receiver.depositToVault(beneficiary, 0)
  const depositCalldata = encodeDepositToVaultCalldata(beneficiary, 0n);

  const contractCalls: ContractCall[] = [
    {
      fromAmount: toAmount,
      fromTokenAddress: toToken,
      toContractAddress: UNIYIELD_DEPOSIT_RECEIVER_BASE,
      toContractCallData: depositCalldata,
      toContractGasLimit: DEPOSIT_TO_VAULT_GAS,
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
    toFallbackAddress: beneficiary, // If call fails, send bridged USDC to user
    // Bridge recipient = receiver contract (LiFi may use this for routing)
    toAddress: UNIYIELD_DEPOSIT_RECEIVER_BASE,
    denyExchanges: ["all"],
    slippage: 0.003,
  } as Parameters<typeof getContractCallsQuote>[0] & { toAddress?: string });

  const route = convertQuoteToRoute(contractCallQuote);
  (route as Route & { depositAmountOut?: string }).depositAmountOut = toAmount;

  return {
    route,
    depositAmountOut: toAmount,
  };
}

/**
 * Creates getContractCalls hook for executeRoute.
 * Returns a single contract call: receiver.depositToVault(beneficiary, 0).
 * No patcher needed - receiver deposits its full balance.
 */
export function createGetContractCallsForUniYield(): (
  params: import("@lifi/sdk").ContractCallParams
) => Promise<{ contractCalls: ContractCall[] }> {
  return async (params) => {
    if (!UNIYIELD_DEPOSIT_RECEIVER_BASE) {
      throw new Error(
        "VITE_UNIYIELD_DEPOSIT_RECEIVER_ADDRESS not set. Configure the UniYieldDepositReceiver address on Base."
      );
    }

    const toToken = USDC_BY_CHAIN[BASE_CHAIN_ID];
    if (!toToken) {
      throw new Error("USDC not configured for Base");
    }

    // Beneficiary = user (vault shares recipient). fromAddress is the sender; toAddress may be bridge recipient.
    const beneficiary = params.fromAddress as Address;

    const depositCalldata = encodeDepositToVaultCalldata(beneficiary, 0n);

    // fromAmount: expected USDC for this call. depositToVault uses full balance; use toAmount when available, else fromAmount (bridge input).
    const expectedAmount =
      params.toAmount > 0n ? params.toAmount : params.fromAmount;

    const contractCalls: ContractCall[] = [
      {
        fromAmount: expectedAmount.toString(),
        fromTokenAddress: toToken,
        toContractAddress: UNIYIELD_DEPOSIT_RECEIVER_BASE,
        toContractCallData: depositCalldata,
        toContractGasLimit: DEPOSIT_TO_VAULT_GAS,
      },
    ];

    return { contractCalls };
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
