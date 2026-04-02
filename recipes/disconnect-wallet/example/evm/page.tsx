"use client";

import { createConfig, http, WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Not connected</h2>
        <p>Connect a wallet first to test disconnecting.</p>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            {connector.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>✅ Connected</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Chain:</strong> {chain?.name}</p>
      <button
        onClick={() => disconnect()}
        style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}
      >
        Disconnect Wallet
      </button>
    </div>
  );
}

export default function DisconnectWalletPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
