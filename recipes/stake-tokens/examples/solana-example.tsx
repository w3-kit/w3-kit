/**
 * examples/solana-example.tsx
 * Next.js page demonstrating native SOL staking.
 */

"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useStakeSol } from "../solana";

const ENDPOINT = "https://api.mainnet-beta.solana.com";

function StakeUI() {
  const { solAmount, setSolAmount, handleStake, status } = useStakeSol();

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Stake SOL (Solana)</h2>
      <WalletMultiButton />

      <div style={{ marginTop: 24 }}>
        <label>Amount (SOL)</label>
        <input
          type="number"
          value={solAmount}
          min="0.01"
          step="0.1"
          onChange={(e) => setSolAmount(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, margin: "8px 0 12px" }}
        />
        <button onClick={handleStake} style={{ width: "100%", padding: 10 }}>
          Stake SOL
        </button>
      </div>

      {status && <p style={{ marginTop: 12, color: "#555" }}>{status}</p>}

      <details style={{ marginTop: 24, fontSize: 13, color: "#555" }}>
        <summary>What just happened?</summary>
        <p>
          A new stake account was created on-chain and your SOL was delegated to
          a validator. Rewards begin accumulating after ~1 epoch (~2 days). You
          can undelegate at any time, but must wait another epoch before
          withdrawing.
        </p>
      </details>
    </div>
  );
}

export default function Page() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <StakeUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
