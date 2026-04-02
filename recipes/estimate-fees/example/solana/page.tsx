"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, useConnection } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  PublicKey,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

interface SolanaFeeEstimate {
  baseFee: number;
  priorityFee: number;
  totalFee: number;
  totalFeeSol: string;
}

function formatLamports(lamports: number): string {
  return `${lamports.toLocaleString()} lamports`;
}

function formatSol(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9) + " SOL";
}

function EstimateFeesUI() {
  const { connection } = useConnection();
  const [from, setFrom] = useState("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs");
  const [to, setTo] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const [estimate, setEstimate] = useState<SolanaFeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!from || !to) return;
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const fromPubkey = new PublicKey(from);
      const toPubkey = new PublicKey(to);

      const { blockhash } = await connection.getLatestBlockhash();

      // Build a sample SOL transfer for fee estimation
      const message = new TransactionMessage({
        payerKey: fromPubkey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 1_000_000, // 0.001 SOL — amount doesn't affect fee
          }),
        ],
      });

      const compiledMessage = message.compileToV0Message();

      const [feeResult, recentFees] = await Promise.all([
        connection.getFeeForMessage(compiledMessage),
        connection.getRecentPrioritizationFees({ lockedWritableAccounts: [fromPubkey, toPubkey] }),
      ]);

      // ★ Base fee: 5000 lamports per signature — deterministic
      const baseFee = feeResult.value ?? 5000;

      // ★ Priority fee: median of recent fees for these accounts
      const sortedFees = recentFees
        .map((f) => f.prioritizationFee)
        .sort((a, b) => a - b);
      const medianFee = sortedFees.length > 0
        ? (sortedFees[Math.floor(sortedFees.length / 2)] ?? 0)
        : 0;

      const totalFee = baseFee + medianFee;

      setEstimate({
        baseFee,
        priorityFee: medianFee,
        totalFee,
        totalFeeSol: (totalFee / LAMPORTS_PER_SOL).toFixed(9),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimation failed — check the addresses");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "640px" }}>
      <h2>Estimate Transaction Fees (Solana)</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="From address (base58)"
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="To address (base58)"
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
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Base Fee</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{formatLamports(estimate.baseFee)}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>flat per signature</td>
              </tr>
              <tr style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.3rem 0.5rem" }}><strong>Priority Fee</strong></td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{formatLamports(estimate.priorityFee)}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "#666", fontSize: "0.85rem" }}>median recent (optional)</td>
              </tr>
              <tr style={{ borderTop: "2px solid #ccc", backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "0.5rem" }}><strong>Total</strong></td>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{formatLamports(estimate.totalFee)}</strong>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{formatSol(estimate.totalFee)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "0.75rem", color: "#666", fontSize: "0.85rem" }}>
            Priority fee is optional but recommended during congestion. Validators process transactions
            with higher compute unit prices first.
          </p>
        </div>
      )}

      <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "0.85rem" }}>
        This estimates fees for a SOL transfer (1 signature). Token transfers and DeFi instructions
        use more compute units and may have higher priority fees.
      </p>
    </div>
  );
}

// ★ ConnectionProvider wraps the app — no wallet needed for fee estimation
export default function EstimateFeesPage() {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <EstimateFeesUI />
    </ConnectionProvider>
  );
}
