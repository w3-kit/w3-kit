"use client";

import { createConfig, http, WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function SignMessageUI() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync, isPending } = useSignMessage();
  const [message, setMessage] = useState("Hello from w3-kit!");
  const [signature, setSignature] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Sign Message (EVM)</h2>
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

  const handleSign = async () => {
    const sig = await signMessageAsync({ message });
    setSignature(sig);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Sign Message (EVM)</h2>
      <p><strong>Address:</strong> {address}</p>
      <div style={{ margin: "1rem 0" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: "0.5rem", width: "300px", fontFamily: "monospace" }}
        />
        <button
          onClick={handleSign}
          disabled={isPending}
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem", cursor: "pointer" }}
        >
          {isPending ? "Signing..." : "Sign"}
        </button>
      </div>
      {signature && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Signature:</strong></p>
          <code style={{ wordBreak: "break-all", fontSize: "0.8rem" }}>{signature}</code>
        </div>
      )}
      <button onClick={() => disconnect()} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
        Disconnect
      </button>
    </div>
  );
}

export default function SignMessagePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SignMessageUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
