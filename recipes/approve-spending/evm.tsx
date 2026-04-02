"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useState } from "react";

const erc20ApproveAbi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function ApproveSpending() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
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

  const handleApprove = () => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ApproveAbi,
      functionName: "approve",
      args: [spender as `0x${string}`, parseUnits(amount, Number(decimals))],
    });
  };

  // ★ Revoke = approve with 0
  const handleRevoke = () => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ApproveAbi,
      functionName: "approve",
      args: [spender as `0x${string}`, 0n],
    });
  };

  return (
    <div>
      <h2>Approve Token Spending</h2>
      <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract" />
      <input value={spender} onChange={(e) => setSpender(e.target.value)} placeholder="Spender address (e.g., DEX router)" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to approve" />
      <input value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Decimals" />

      {allowance !== undefined && (
        <p>Current allowance: {formatUnits(allowance, Number(decimals))}</p>
      )}

      <button onClick={handleApprove} disabled={isPending}>Approve</button>
      <button onClick={handleRevoke} disabled={isPending}>Revoke (set to 0)</button>

      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>Done! Tx: {hash}</p>}
    </div>
  );
}
