import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";

// Generic swap router interface — plug in any AMM router address
const SWAP_ROUTER_ABI = [
  {
    name: "swapExactTokensForTokens",
    type: "function",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
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

interface SwapParams {
  routerAddress: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: string;
  amountOutMin: string;
  // ★ Use separate decimals for each token — they can differ (e.g. USDC=6, WETH=18)
  decimalsIn?: number;
  decimalsOut?: number;
}

export function useSwapTokens() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function swap(params: SwapParams) {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);
    try {
      const decimalsIn = params.decimalsIn ?? 18;
      const decimalsOut = params.decimalsOut ?? 18;
      const amountIn = parseUnits(params.amountIn, decimalsIn);
      const amountOutMin = parseUnits(params.amountOutMin, decimalsOut);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      // Step 1: approve router to spend tokenIn
      const approveTx = await walletClient.writeContract({
        address: params.tokenIn,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [params.routerAddress, amountIn],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Step 2: execute swap
      const swapTx = await walletClient.writeContract({
        address: params.routerAddress,
        abi: SWAP_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [
          amountIn,
          amountOutMin,
          [params.tokenIn, params.tokenOut],
          walletClient.account.address,
          deadline,
        ],
      });
      return await publicClient.waitForTransactionReceipt({ hash: swapTx });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { swap, loading, error };
}
