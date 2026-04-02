"use client";

import { createConfig, http, WagmiProvider, useAccount, useConnect } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: { [sepolia.id]: http() },
});

const queryClient = new QueryClient();

function CreateTokenUI() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Create Token (EVM)</h2>
        {connectors.map((c) => (
          <button key={c.uid} onClick={() => connect({ connector: c })} style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}>{c.name}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Create Token (EVM)</h2>
      <p><strong>Connected:</strong> {address}</p>
      <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", background: "#f9f9f9" }}>
        <h3>How to create an ERC-20 token:</h3>
        <ol style={{ lineHeight: "1.8" }}>
          <li>Write a Solidity contract (see <code>create-token.learn.md</code>)</li>
          <li>Compile with Hardhat or Foundry</li>
          <li>Deploy using <code>useDeployContract</code> from wagmi</li>
          <li>Verify on Etherscan</li>
        </ol>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Unlike Solana, EVM token creation requires a compiled Solidity contract.
          See the <code>contracts/evm/</code> directory for production-ready templates.
        </p>
      </div>
    </div>
  );
}

export default function CreateTokenPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CreateTokenUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
