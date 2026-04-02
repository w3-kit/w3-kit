"use client";

import {
  createConfig, http, WagmiProvider,
  useAccount, useConnect, useReadContract, useWriteContract, useWaitForTransactionReceipt,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { parseUnits, formatUnits } from "viem";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: { [mainnet.id]: http(), [sepolia.id]: http() },
});

const queryClient = new QueryClient();

const erc20ApproveAbi = [
  {
    name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function ApproveUI() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [decimals, setDecimals] = useState("6");

  const { data: allowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20ApproveAbi,
    functionName: "allowance",
    args: address && spender ? [address, spender as `0x${string}`] : undefined,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Approve Spending (EVM)</h2>
        {connectors.map((c) => (
          <button key={c.uid} onClick={() => connect({ connector: c })} style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}>{c.name}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Approve Spending (EVM)</h2>
      <p><strong>Owner:</strong> {address}</p>
      <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={spender} onChange={(e) => setSpender(e.target.value)} placeholder="Spender (DEX router, etc)" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" style={{ width: "200px", padding: "0.5rem", fontFamily: "monospace" }} />
      <input value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Dec" style={{ width: "60px", padding: "0.5rem", fontFamily: "monospace", marginLeft: "0.25rem" }} />

      {allowance !== undefined && <p>Current allowance: {formatUnits(allowance, Number(decimals))}</p>}

      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => writeContract({ address: tokenAddress as `0x${string}`, abi: erc20ApproveAbi, functionName: "approve", args: [spender as `0x${string}`, parseUnits(amount, Number(decimals))] })} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer", marginRight: "0.5rem" }}>Approve</button>
        <button onClick={() => writeContract({ address: tokenAddress as `0x${string}`, abi: erc20ApproveAbi, functionName: "approve", args: [spender as `0x${string}`, 0n] })} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}>Revoke</button>
      </div>

      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>Done! Tx: <code style={{ fontSize: "0.8rem" }}>{hash}</code></p>}
    </div>
  );
}

export default function ApproveSpendingPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApproveUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
