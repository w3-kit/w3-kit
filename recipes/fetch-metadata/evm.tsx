"use client";

import { useReadContracts } from "wagmi";
import { useState } from "react";

const erc20MetadataAbi = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export function FetchTokenMetadata() {
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC

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

  return (
    <div>
      <h2>Token Metadata</h2>
      <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract address" />
      {isLoading && <p>Loading...</p>}
      {data && (
        <div>
          <p><strong>Name:</strong> {name?.result as string}</p>
          <p><strong>Symbol:</strong> {symbol?.result as string}</p>
          <p><strong>Decimals:</strong> {decimals?.result?.toString()}</p>
          <p><strong>Total Supply:</strong> {totalSupply?.result?.toString()}</p>
        </div>
      )}
    </div>
  );
}
