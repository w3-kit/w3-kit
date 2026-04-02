"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient, formatEther, parseEther } from "viem";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const queryClient = new QueryClient();

const publicClient = createPublicClient({ chain: mainnet, transport: http() });

interface FeeEstimate {
  gasUnits: bigint;
  baseFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  estimatedCostWei: bigint;
  estimatedCostEth: string;
}

function formatGwei(wei: bigint): string {
  return `${(Number(wei) / 1e9).toFixed(3)} gwei`;
}

function EstimateFeesUI() {
  const [from, setFrom] = useState("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  const [to, setTo] = useState("0x742d35Cc6634C0532925a3b8D4C9e2eD6f3C76Ea");
  const [valueEth, setValueEth] = useState("0.001");
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!from || !to) return;
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const [gasUnits, feeData] = await Promise.all([
        publicClient.estimateGas({
          account: from as `0x${string}`,
          to: to as `0x${string}`,
          value: parseEther(valueEth || "0"),
        }),
        publicClient.estimateFeesPerGas(),
      ]);

      const { maxFeePerGas, maxPriorityFeePerGas } = feeData;
      const baseFeePerGas = maxFeePerGas - maxPriorityFeePerGas;
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

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "640px" }}>
      <h2>Estimate Gas Fees (EVM / EIP-1559)</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="From address (0x...)"
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="To address (0x...)"
        />
        <input
          value={valueEth}
          onChange={(e) => setValueEth(e.target.value)}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="Value in ETH (e.g., 0.001)"
        />
        <button
          onClick={handleEstimate}
          disabled={isLoading || !from || !to}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", alignSelf: "flex-start" }}
        >
          {isLoading ? "Estimating..." : "Estimate Fees"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {estimate && (
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
          <h3 style={{ marginTop: 0 }}>Fee Breakdown</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Gas Units</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{estimate.gasUnits.toString()}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>computational work</td>
              </tr>
              <tr style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Base Fee</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{formatGwei(estimate.baseFeePerGas)}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>burned by protocol</td>
              </tr>
              <tr style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Priority Fee</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{formatGwei(estimate.maxPriorityFeePerGas)}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>tip to validator</td>
              </tr>
              <tr style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Max Fee</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{formatGwei(estimate.maxFeePerGas)}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>per gas ceiling</td>
              </tr>
              <tr style={{ borderTop: "2px solid #ccc", backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "0.5rem" }}><strong>Estimated Total</strong></td>
                <td style={{ padding: "0.5rem" }} colSpan={2}>
                  <strong>{estimate.estimatedCostEth} ETH</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "0.75rem", color: "#666", fontSize: "0.85rem" }}>
            Actual cost = min(baseFee + tip, maxFee) × gasUnits. You may pay less than this estimate.
          </p>
        </div>
      )}

      <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "0.85rem" }}>
        Note: This estimates a simple ETH transfer (21,000 gas). For contract interactions, the gas
        units will be higher. On L2s (Optimism, Arbitrum), an additional L1 data fee applies.
      </p>
    </div>
  );
}

// ★ WagmiProvider included so this page is self-contained — no wallet connection needed
export default function EstimateFeesPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EstimateFeesUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
