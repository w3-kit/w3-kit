/**
 * examples/evm-example.tsx
 * Next.js page demonstrating EVM reward claiming.
 */

"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useClaimRewards } from "../evm";

const config = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } });
const queryClient = new QueryClient();

function ClaimUI() {
  const { pendingRewards, handleClaim, claiming, claimed } = useClaimRewards();

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Claim Staking Rewards (EVM)</h2>

      <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Pending rewards</p>
        <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: "bold" }}>
          {parseFloat(pendingRewards).toFixed(4)} tokens
        </p>
      </div>

      <button
        onClick={handleClaim}
        disabled={claiming || parseFloat(pendingRewards) === 0}
        style={{ width: "100%", padding: 12, fontSize: 16 }}
      >
        {claiming ? "Claiming…" : "Claim Rewards"}
      </button>

      {claimed && (
        <p style={{ color: "green", marginTop: 12 }}>
          Rewards claimed! They should appear in your wallet shortly.
        </p>
      )}

      {parseFloat(pendingRewards) === 0 && !claiming && (
        <p style={{ color: "#aaa", marginTop: 12, fontSize: 13 }}>
          No pending rewards. Rewards accrue over time — check back later.
        </p>
      )}

      <details style={{ marginTop: 24, fontSize: 13, color: "#555" }}>
        <summary>What just happened?</summary>
        <p>
          The UI read <code>pendingRewards(address)</code> from the staking
          contract. Clicking Claim sent a <code>claim()</code> transaction that
          transferred accumulated reward tokens directly to your wallet.
        </p>
      </details>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ClaimUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
