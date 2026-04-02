"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useState } from "react";

// ★ ERC-20 balanceOf ABI — the only function you need to read a token balance
const erc20BalanceOfAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export function GetNativeBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({ address });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Native Balance</h2>
      <p>{balance?.formatted} {balance?.symbol}</p>
    </div>
  );
}

export function GetTokenBalance() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC on Ethereum
  const [decimals, setDecimals] = useState("6");

  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20BalanceOfAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  return (
    <div>
      <h2>ERC-20 Token Balance</h2>
      <input
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        placeholder="Token contract address"
      />
      <input
        value={decimals}
        onChange={(e) => setDecimals(e.target.value)}
        placeholder="Decimals (e.g., 6)"
      />
      {isLoading && <p>Loading...</p>}
      {balance !== undefined && (
        <p>Balance: {formatUnits(balance, Number(decimals))} (raw: {balance.toString()})</p>
      )}
    </div>
  );
}
