/**
 * examples/evm-example.tsx
 * Next.js page demonstrating EVM token staking.
 */

"use client";

import { useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStakeTokens } from "../evm";

const config = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } });
const queryClient = new QueryClient();

function StakeUI() {
  const {
    amount, setAmount,
    stakedBalance,
    handleApprove, approved,
    handleStake, staking, staked,
  } = useStakeTokens();

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Stake Tokens (EVM)</h2>

      <p>Currently staked: <strong>{stakedBalance} tokens</strong></p>

      <input
        type="number"
        placeholder="Amount to stake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleApprove} disabled={!amount} style={{ flex: 1, padding: 10 }}>
          1. Approve
        </button>
        <button onClick={handleStake} disabled={!approved || staking} style={{ flex: 1, padding: 10 }}>
          {staking ? "Staking…" : "2. Stake"}
        </button>
      </div>

      {staked && (
        <p style={{ color: "green", marginTop: 12 }}>
          Staked successfully! Your balance will update shortly.
        </p>
      )}

      <details style={{ marginTop: 24, fontSize: 13, color: "#555" }}>
        <summary>What just happened?</summary>
        <p>
          Step 1 granted the staking contract permission to spend your tokens.
          Step 2 called <code>stake(amount)</code>, which locked your tokens and
          began accruing rewards.
        </p>
      </details>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <StakeUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
