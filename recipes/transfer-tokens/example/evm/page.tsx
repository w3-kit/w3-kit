"use client";

import {
  createConfig, http, WagmiProvider,
  useAccount, useConnect, useSendTransaction, useWriteContract, useWaitForTransactionReceipt,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { parseEther, parseUnits } from "viem";
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

function TransferUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const [mode, setMode] = useState<"native" | "token">("native");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [decimals, setDecimals] = useState("6");

  const { sendTransaction, data: nativeHash, isPending: nativePending } = useSendTransaction();
  const { writeContract, data: tokenHash, isPending: tokenPending } = useWriteContract();
  const hash = mode === "native" ? nativeHash : tokenHash;
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Transfer Tokens (EVM)</h2>
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

  const handleTransfer = () => {
    if (mode === "native") {
      sendTransaction({ to: to as `0x${string}`, value: parseEther(amount) });
    } else {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20TransferAbi,
        functionName: "transfer",
        args: [to as `0x${string}`, parseUnits(amount, Number(decimals))],
      });
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Transfer Tokens (EVM)</h2>
      <p><strong>From:</strong> {address}</p>
      <p><strong>Chain:</strong> {chain?.name}</p>

      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setMode("native")} style={{ fontWeight: mode === "native" ? "bold" : "normal", padding: "0.5rem 1rem" }}>
          Native ({chain?.nativeCurrency?.symbol})
        </button>
        <button onClick={() => setMode("token")} style={{ fontWeight: mode === "token" ? "bold" : "normal", padding: "0.5rem 1rem" }}>
          ERC-20
        </button>
      </div>

      {mode === "token" && (
        <div style={{ marginBottom: "0.5rem" }}>
          <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }} />
          <input value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Decimals" style={{ width: "80px", padding: "0.5rem", fontFamily: "monospace", marginTop: "0.25rem" }} />
        </div>
      )}
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient (0x...)" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.5rem" }} />

      <button onClick={handleTransfer} disabled={nativePending || tokenPending} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        {nativePending || tokenPending ? "Signing..." : "Send"}
      </button>

      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>Confirmed! Tx: <code style={{ fontSize: "0.8rem" }}>{hash}</code></p>}
    </div>
  );
}

export default function TransferTokensPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TransferUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
