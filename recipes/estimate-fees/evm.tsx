"use client";

import { createPublicClient, http, formatEther, parseEther } from "viem";
import { mainnet } from "viem/chains";
import { useState } from "react";

const client = createPublicClient({ chain: mainnet, transport: http() });

export interface EvmFeeEstimate {
  gasUnits: bigint;
  // ★ Base fee: burned by the protocol (EIP-1559). Fluctuates with network demand.
  baseFeePerGas: bigint;
  // ★ Priority fee: tip paid to the validator for including your tx.
  maxPriorityFeePerGas: bigint;
  // ★ Max fee: the most you're willing to pay per gas unit.
  //    Actual cost = min(baseFee + priorityFee, maxFee) * gasUnits
  maxFeePerGas: bigint;
  estimatedCostWei: bigint;
  estimatedCostEth: string;
}

export async function estimateEvmFees(
  tx: { to: `0x${string}`; data?: `0x${string}`; value?: bigint },
  from: `0x${string}`
): Promise<EvmFeeEstimate> {
  const [gasUnits, feeData] = await Promise.all([
    client.estimateGas({ ...tx, account: from }),
    client.estimateFeesPerGas(),
  ]);

  const { maxFeePerGas, maxPriorityFeePerGas } = feeData;

  // baseFee = maxFee - priorityFee (approximation; exact value is in the latest block)
  const baseFeePerGas = maxFeePerGas - maxPriorityFeePerGas;
  const estimatedCostWei = gasUnits * maxFeePerGas;

  return {
    gasUnits,
    baseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas,
    estimatedCostWei,
    estimatedCostEth: formatEther(estimatedCostWei),
  };
}

// Helper: convert wei cost to USD given a current ETH price
export function weiToUsd(wei: bigint, ethPriceUsd: number): string {
  const eth = Number(formatEther(wei));
  return (eth * ethPriceUsd).toFixed(4);
}

// Component: input a transaction → display EIP-1559 fee breakdown
export function EstimateFees() {
  const [to, setTo] = useState("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  const [value, setValue] = useState("0.001");
  const [from, setFrom] = useState("0x742d35Cc6634C0532925a3b8D4C9e2eD6f3C76Ea");
  const [estimate, setEstimate] = useState<EvmFeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const result = await estimateEvmFees(
        {
          to: to as `0x${string}`,
          value: parseEther(value || "0"),
        },
        from as `0x${string}`
      );
      setEstimate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatGwei = (wei: bigint) => `${(Number(wei) / 1e9).toFixed(2)} gwei`;

  return (
    <div>
      <h2>Estimate Gas Fees (EVM / EIP-1559)</h2>
      <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From address (0x...)" />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To address (0x...)" />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value in ETH (e.g., 0.001)" />
      <button onClick={handleEstimate} disabled={isLoading || !to || !from}>
        {isLoading ? "Estimating..." : "Estimate Fees"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {estimate && (
        <div>
          <p><strong>Gas Units:</strong> {estimate.gasUnits.toString()}</p>
          <p><strong>Base Fee:</strong> {formatGwei(estimate.baseFeePerGas)} (burned)</p>
          <p><strong>Priority Fee:</strong> {formatGwei(estimate.maxPriorityFeePerGas)} (to validator)</p>
          <p><strong>Max Fee:</strong> {formatGwei(estimate.maxFeePerGas)}</p>
          <p><strong>Estimated Cost:</strong> {estimate.estimatedCostEth} ETH</p>
        </div>
      )}
    </div>
  );
}
