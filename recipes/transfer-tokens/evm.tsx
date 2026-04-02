"use client";

import { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { useState } from "react";

// ★ ERC-20 transfer ABI
const erc20TransferAbi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function TransferNative() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendTransaction, data: hash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleTransfer = () => {
    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div>
      <h2>Transfer ETH</h2>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address (0x...)" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (e.g., 0.01)" />
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? "Confirming..." : "Send"}
      </button>
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isSuccess && <p>Transfer confirmed! Tx: {hash}</p>}
    </div>
  );
}

export function TransferToken() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [decimals, setDecimals] = useState("6");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleTransfer = () => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20TransferAbi,
      functionName: "transfer",
      args: [to as `0x${string}`, parseUnits(amount, Number(decimals))],
    });
  };

  return (
    <div>
      <h2>Transfer ERC-20 Token</h2>
      <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract address" />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address (0x...)" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (e.g., 10.5)" />
      <input value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Decimals (e.g., 6)" />
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? "Confirming..." : "Send"}
      </button>
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isSuccess && <p>Transfer confirmed! Tx: {hash}</p>}
    </div>
  );
}
