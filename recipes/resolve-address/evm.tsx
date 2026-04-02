"use client";

import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { useState } from "react";

// ★ ENS only resolves on L1 mainnet — use a separate mainnet client even when your
//    app targets an L2. The resolution result (an address) is chain-agnostic.
const client = createPublicClient({ chain: mainnet, transport: http() });

// Forward: ENS name → address
export async function resolveEnsName(name: string): Promise<`0x${string}` | null> {
  return client.getEnsAddress({ name });
}

// Reverse: address → ENS name (returns null if no reverse record set)
export async function reverseResolveEns(address: `0x${string}`): Promise<string | null> {
  return client.getEnsName({ address });
}

// Convenience: truncate an address for display when no ENS name exists
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

// Component: resolve ENS name or address with loading / error states
export function ResolveAddress() {
  const [input, setInput] = useState("vitalik.eth");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (input.startsWith("0x")) {
        // Reverse lookup: address → ENS name
        const name = await reverseResolveEns(input as `0x${string}`);
        setResult(name ?? `No ENS name — ${truncateAddress(input)}`);
      } else {
        // Forward lookup: ENS name → address
        const address = await resolveEnsName(input);
        setResult(address ?? "Not registered");
      }
    } catch {
      setError("Resolution failed — check the name or address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Resolve ENS Address (EVM)</h2>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ENS name (vitalik.eth) or 0x address"
      />
      <button onClick={handleResolve} disabled={isLoading || !input}>
        {isLoading ? "Resolving..." : "Resolve"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p><strong>Result:</strong> {result}</p>}
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Forward: enter an ENS name → get address. Reverse: enter 0x address → get name.
      </p>
    </div>
  );
}
