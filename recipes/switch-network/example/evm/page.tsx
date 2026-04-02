"use client";

import { createConfig, http, WagmiProvider, useAccount, useConnect, useSwitchChain } from "wagmi";
import { mainnet, sepolia, arbitrum, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [mainnet, sepolia, arbitrum, base],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function SwitchNetworkUI() {
  const { chain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { chains, switchChain, isPending } = useSwitchChain();

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Switch Network (EVM)</h2>
        <p>Connect a wallet first.</p>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
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
      <h2>Switch Network (EVM)</h2>
      <p><strong>Current:</strong> {chain?.name} (ID: {chain?.id})</p>
      <div style={{ marginTop: "1rem" }}>
        {chains.map((c) => (
          <button
            key={c.id}
            onClick={() => switchChain({ chainId: c.id })}
            disabled={isPending || c.id === chain?.id}
            style={{
              display: "block",
              margin: "0.5rem 0",
              padding: "0.5rem 1rem",
              cursor: c.id === chain?.id ? "default" : "pointer",
              background: c.id === chain?.id ? "#e0e0e0" : "white",
              fontWeight: c.id === chain?.id ? "bold" : "normal",
            }}
          >
            {c.name} (ID: {c.id})
            {c.id === chain?.id && " ← current"}
          </button>
        ))}
      </div>
      {isPending && <p>Switching...</p>}
    </div>
  );
}

export default function SwitchNetworkPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SwitchNetworkUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
