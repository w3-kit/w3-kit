"use client";

import { createConfig, http, WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// ★ Full provider setup — in a real app, this lives in your layout/providers file
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function WalletUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>✅ Connected</h2>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Chain:</strong> {chain?.name} (ID: {chain?.id})</p>
        <button onClick={() => disconnect()} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Connect Wallet (EVM)</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {connector.name}
          {isPending && " (connecting...)"}
        </button>
      ))}
    </div>
  );
}

// ★ This is the full page — drop it into your Next.js app at app/connect/page.tsx
export default function ConnectWalletPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
