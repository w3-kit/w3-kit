"use client";

import { useAccount } from "wagmi";
import { useState } from "react";

// ★ Minimal ERC-20 — for production, use OpenZeppelin's full implementation
const MINIMAL_ERC20_BYTECODE = "0x" as `0x${string}`; // Placeholder — see .learn.md for full contract

// In practice, you'd compile an OpenZeppelin ERC-20 contract and use its bytecode
// This recipe focuses on the deployment pattern, not the contract code

const erc20Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "initialSupply", type: "uint256" },
    ],
  },
] as const;

export function CreateToken() {
  const { address } = useAccount();
  const [name, setName] = useState("My Token");
  const [symbol, setSymbol] = useState("MTK");
  const [supply, setSupply] = useState("1000000");

  // ★ In production: compile your Solidity contract, import the artifact,
  // and use deployContract with the actual bytecode
  return (
    <div>
      <h2>Create ERC-20 Token</h2>
      <p>Connected: {address}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Token name" />
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" />
      <input value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="Initial supply" />
      <p><em>EVM token creation requires deploying a Solidity contract.</em></p>
      <p><em>See the .learn.md for the full OpenZeppelin-based contract and deployment flow.</em></p>
    </div>
  );
}
