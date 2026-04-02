import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";

// Generic liquidity router ABI — compatible with any Uniswap V2-style router
const ROUTER_ABI = [
  {
    name: "addLiquidity",
    type: "function",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
  },
] as const;

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface AddLiquidityParams {
  routerAddress: `0x${string}`;
  tokenA: `0x${string}`;
  tokenB: `0x${string}`;
  amountA: string;
  amountB: string;
  slippageBps?: number; // basis points, default 50 = 0.5%
  // ★ Use separate decimals for each token — they can differ (e.g. USDC=6, WETH=18)
  decimalsA?: number;
  decimalsB?: number;
}

export function useProvideLiquidity() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addLiquidity(params: AddLiquidityParams) {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);
    try {
      const decimalsA = params.decimalsA ?? 18;
      const decimalsB = params.decimalsB ?? 18;
      const slippageBps = params.slippageBps ?? 50;
      const amountA = parseUnits(params.amountA, decimalsA);
      const amountB = parseUnits(params.amountB, decimalsB);
      const amountAMin = (amountA * BigInt(10000 - slippageBps)) / BigInt(10000);
      const amountBMin = (amountB * BigInt(10000 - slippageBps)) / BigInt(10000);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      // Approve router to spend both tokens
      for (const [token, amount] of [[params.tokenA, amountA], [params.tokenB, amountB]] as const) {
        const approveTx = await walletClient.writeContract({
          address: token,
          abi: ERC20_APPROVE_ABI,
          functionName: "approve",
          args: [params.routerAddress, amount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // Add liquidity
      const tx = await walletClient.writeContract({
        address: params.routerAddress,
        abi: ROUTER_ABI,
        functionName: "addLiquidity",
        args: [
          params.tokenA, params.tokenB,
          amountA, amountB,
          amountAMin, amountBMin,
          walletClient.account.address,
          deadline,
        ],
      });
      return await publicClient.waitForTransactionReceipt({ hash: tx });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { addLiquidity, loading, error };
}
