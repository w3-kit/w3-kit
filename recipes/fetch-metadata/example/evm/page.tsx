"use client";

import { createConfig, http, WagmiProvider, useReadContracts } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const queryClient = new QueryClient();

const erc20MetadataAbi = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

function MetadataUI() {
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const contract = { address: tokenAddress as `0x${string}`, abi: erc20MetadataAbi };

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...contract, functionName: "name" },
      { ...contract, functionName: "symbol" },
      { ...contract, functionName: "decimals" },
      { ...contract, functionName: "totalSupply" },
    ],
  });

  const [name, symbol, decimals, totalSupply] = data || [];
  const dec = Number(decimals?.result ?? 18);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Fetch Token Metadata (EVM)</h2>
      <input
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }}
        placeholder="Token contract address"
      />
      {isLoading && <p>Loading...</p>}
      {data && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <p><strong>Name:</strong> {name?.result as string}</p>
          <p><strong>Symbol:</strong> {symbol?.result as string}</p>
          <p><strong>Decimals:</strong> {dec}</p>
          <p><strong>Total Supply:</strong> {totalSupply?.result ? formatUnits(totalSupply.result as bigint, dec) : "N/A"}</p>
        </div>
      )}
      <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>
        Try: USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48), WETH (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
      </p>
    </div>
  );
}

// ★ No wallet needed — metadata reads don't require a connected wallet
export default function FetchMetadataPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MetadataUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
