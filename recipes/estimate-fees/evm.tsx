"use client";

import { usePublicClient } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useState } from "react";

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

// Helper: convert wei cost to USD given a current ETH price
export function weiToUsd(wei: bigint, ethPriceUsd: number): string {
  const eth = Number(formatEther(wei));
  return (eth * ethPriceUsd).toFixed(4);
}

// Component: input a transaction → display EIP-1559 fee breakdown
export function EstimateFees() {
  const publicClient = usePublicClient();
  const [to, setTo] = useState("");
  const [value, setValue] = useState("0.001");
  const [from, setFrom] = useState("");
  const [estimate, setEstimate] = useState<EvmFeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!publicClient || !to || !from) return;
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const [gasUnits, feeData, block] = await Promise.all([
        publicClient.estimateGas({
          to: to as `0x${string}`,
          value: parseEther(value || "0"),
          account: from as `0x${string}`,
        }),
        publicClient.estimateFeesPerGas(),
        // ★ Read baseFeePerGas directly from the latest block (authoritative source)
        publicClient.getBlock({ blockTag: "latest" }),
      ]);

      const { maxFeePerGas, maxPriorityFeePerGas } = feeData;
      // ★ baseFeePerGas comes from the block header — exact, not derived
      const baseFeePerGas = block.baseFeePerGas ?? 0n;
      const estimatedCostWei = gasUnits * maxFeePerGas;

      setEstimate({
        gasUnits,
        baseFeePerGas,
        maxPriorityFeePerGas,
        maxFeePerGas,
        estimatedCostWei,
        estimatedCostEth: formatEther(estimatedCostWei),
      });
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
