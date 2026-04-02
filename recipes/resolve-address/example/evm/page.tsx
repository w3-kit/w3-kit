"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient } from "viem";
import { useState } from "react";

// ★ ENS resolution requires a mainnet client regardless of your app's target chain
const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const queryClient = new QueryClient();

const ensClient = createPublicClient({ chain: mainnet, transport: http() });

function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

function ResolveAddressUI() {
  const [input, setInput] = useState("vitalik.eth");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResolve = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      if (input.startsWith("0x")) {
        // Reverse lookup: 0x address → ENS name
        const name = await ensClient.getEnsName({ address: input as `0x${string}` });
        setResult(name ?? `No ENS name — ${truncateAddress(input)}`);
      } else {
        // Forward lookup: ENS name → 0x address
        const address = await ensClient.getEnsAddress({ name: input });
        setResult(address ?? "Name not registered");
      }
    } catch {
      setError("Resolution failed — verify the name or address and try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "600px" }}>
      <h2>Resolve ENS Address (EVM)</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleResolve()}
          style={{ flex: 1, padding: "0.5rem", fontFamily: "monospace" }}
          placeholder="ENS name (vitalik.eth) or 0x address"
        />
        <button
          onClick={handleResolve}
          disabled={isLoading || !input.trim()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isLoading ? "Resolving..." : "Resolve"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", margin: "0.5rem 0" }}>{error}</p>
      )}

      {result && (
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p style={{ margin: 0, wordBreak: "break-all" }}>
              <strong>Result:</strong> {result}
            </p>
            {result.startsWith("0x") && (
              <button
                onClick={handleCopy}
                style={{ padding: "0.25rem 0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", color: "#666", fontSize: "0.85rem" }}>
        <p><strong>Examples to try:</strong></p>
        <ul style={{ margin: "0.25rem 0", paddingLeft: "1.25rem" }}>
          <li>Forward: <code>vitalik.eth</code>, <code>nick.eth</code>, <code>rainbowwallet.eth</code></li>
          <li>Reverse: <code>0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code> (Vitalik)</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Note: ENS resolves on L1 mainnet only. Resolution is free — no gas required.
        </p>
      </div>
    </div>
  );
}

// ★ WagmiProvider is included so this page can be dropped into any Next.js app
export default function ResolveAddressPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ResolveAddressUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
