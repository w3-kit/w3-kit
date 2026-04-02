/**
 * examples/solana-example.tsx
 * Next.js page demonstrating native SOL stake withdrawal (deactivate + withdraw).
 */

"use client";

import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useWithdrawStake } from "../solana";

const ENDPOINT = "https://api.mainnet-beta.solana.com";

function WithdrawUI() {
  const [stakeAccount, setStakeAccount] = useState("");
  const { step, status, handleDeactivate, handleWithdraw } =
    useWithdrawStake(stakeAccount);

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Claim SOL Stake Rewards</h2>
      <WalletMultiButton />

      <div style={{ marginTop: 24 }}>
        <label style={{ fontSize: 13 }}>Stake Account Address</label>
        <input
          type="text"
          value={stakeAccount}
          onChange={(e) => setStakeAccount(e.target.value)}
          placeholder="Paste your stake account pubkey"
          style={{ display: "block", width: "100%", padding: 8, margin: "6px 0 16px" }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDeactivate}
            disabled={!stakeAccount || step !== "idle"}
            style={{ flex: 1, padding: 10 }}
          >
            1. Deactivate
          </button>
          <button
            onClick={handleWithdraw}
            disabled={step !== "withdrawing"}
            style={{ flex: 1, padding: 10 }}
          >
            2. Withdraw
          </button>
        </div>

        {status && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#555" }}>{status}</p>
        )}
      </div>

      <details style={{ marginTop: 24, fontSize: 13, color: "#555" }}>
        <summary>Two-step withdrawal explained</summary>
        <p>
          Solana stake rewards are embedded in the stake account balance. You
          must first deactivate the stake (starts a ~1 epoch cooldown), then
          withdraw all lamports once the cooldown is complete. There is no
          separate "claim rewards" call — rewards and principal come out together.
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
          <WithdrawUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
