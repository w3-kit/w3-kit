"use client";

import {
  createConfig, http, WagmiProvider,
  useAccount, useConnect, useBalance, useReadContract,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatUnits } from "viem";
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

const erc20BalanceOfAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

function BalanceUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: nativeBalance } = useBalance({ address });
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20BalanceOfAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Get Balance (EVM)</h2>
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

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Get Balance (EVM)</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Chain:</strong> {chain?.name}</p>

      <div style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Native Balance</h3>
        <p>{nativeBalance?.formatted} {nativeBalance?.symbol}</p>
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <h3>ERC-20 Token Balance</h3>
        <input
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", fontSize: "0.8rem" }}
          placeholder="Token contract address"
        />
        {tokenBalance !== undefined && (
          <p>Balance: {formatUnits(tokenBalance, 6)} (raw: {tokenBalance.toString()})</p>
        )}
      </div>
    </div>
  );
}

export default function GetBalancePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BalanceUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
