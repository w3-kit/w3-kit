"use client";

import {
  Connection,
  PublicKey,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";

export interface SolanaFeeEstimate {
  // ★ Base fee: deterministic — 5000 lamports per signature. Not configurable.
  baseFee: number;
  // ★ Priority fee: optional but increasingly necessary during congestion.
  //    Set via ComputeBudgetProgram.setComputeUnitPrice.
  //    This is the median of recent fees — a balanced estimate.
  priorityFee: number;
  totalFee: number;
  totalFeeSol: string;
}

export async function estimateSolanaFees(
  connection: Connection,
  message: TransactionMessage,
  writableAccounts: PublicKey[]
): Promise<SolanaFeeEstimate> {
  const compiledMessage = message.compileToV0Message();

  const [feeResult, recentFees] = await Promise.all([
    connection.getFeeForMessage(compiledMessage),
    connection.getRecentPrioritizationFees({ lockedWritableAccounts: writableAccounts }),
  ]);

  // ★ Base fee is 5000 lamports per signature — falls back to this if RPC returns null
  const baseFee = feeResult.value ?? 5000;

  // Use the median of recent fees to avoid outlier spikes
  const sortedFees = recentFees.map((f) => f.prioritizationFee).sort((a, b) => a - b);
  const medianFee = sortedFees.length > 0
    ? (sortedFees[Math.floor(sortedFees.length / 2)] ?? 0)
    : 0;

  const totalFee = baseFee + medianFee;

  return {
    baseFee,
    priorityFee: medianFee,
    totalFee,
    totalFeeSol: (totalFee / LAMPORTS_PER_SOL).toFixed(9),
  };
}

// Component: build a sample transfer message → display fee breakdown
export function EstimateFees() {
  const { connection } = useConnection();
  const [from, setFrom] = useState("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs");
  const [to, setTo] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const [estimate, setEstimate] = useState<SolanaFeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const fromPubkey = new PublicKey(from);
      const toPubkey = new PublicKey(to);

      const { blockhash } = await connection.getLatestBlockhash();

      // Build a simple SOL transfer message for fee estimation
      const message = new TransactionMessage({
        payerKey: fromPubkey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 1_000_000, // 0.001 SOL — placeholder amount
          }),
        ],
      });

      const result = await estimateSolanaFees(connection, message, [fromPubkey, toPubkey]);
      setEstimate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimation failed — check the addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLamports = (lamports: number) =>
    `${lamports.toLocaleString()} lamports (${(lamports / LAMPORTS_PER_SOL).toFixed(9)} SOL)`;

  return (
    <div>
      <h2>Estimate Transaction Fees (Solana)</h2>
      <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From address (base58)" />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To address (base58)" />
      <button onClick={handleEstimate} disabled={isLoading || !from || !to}>
        {isLoading ? "Estimating..." : "Estimate Fees"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {estimate && (
        <div>
          <p><strong>Base Fee:</strong> {formatLamports(estimate.baseFee)} (flat per signature)</p>
          <p><strong>Priority Fee:</strong> {formatLamports(estimate.priorityFee)} (median recent)</p>
          <p><strong>Total:</strong> {formatLamports(estimate.totalFee)}</p>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            Priority fee is optional — but recommended during high congestion.
          </p>
        </div>
      )}
    </div>
  );
}
