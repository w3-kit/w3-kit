"use client";

import {
  createConfig,
  http,
  WagmiProvider,
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const erc721Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

function BuyNFTUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const [step, setStep] = useState<"approve" | "buy">("approve");
  const [contractAddress, setContractAddress] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [tokenId, setTokenId] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Buy NFT (EVM)</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    );
  }

  const handleAction = () => {
    if (step === "approve") {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: "approve",
        args: [counterparty as `0x${string}`, BigInt(tokenId)],
      });
    } else {
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: "transferFrom",
        args: [counterparty as `0x${string}`, address as `0x${string}`, BigInt(tokenId)],
      });
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Buy NFT (EVM) — approve + transferFrom</h2>
      <p><strong>Wallet:</strong> {address}</p>
      <p><strong>Chain:</strong> {chain?.name}</p>
      <p style={{ background: "#fffbe6", padding: "0.75rem", border: "1px solid #ffd700", marginBottom: "1rem" }}>
        Educational demo: Step 1 = seller approves buyer. Step 2 = buyer calls transferFrom.
        Real marketplaces bundle payment + transfer atomically.
      </p>

      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => setStep("approve")}
          style={{ fontWeight: step === "approve" ? "bold" : "normal", padding: "0.5rem 1rem" }}
        >
          Step 1: Approve (Seller)
        </button>
        <button
          onClick={() => setStep("buy")}
          style={{ fontWeight: step === "buy" ? "bold" : "normal", padding: "0.5rem 1rem" }}
        >
          Step 2: Buy (Buyer)
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px" }}>
        <input
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="NFT contract address (0x...)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          placeholder={step === "approve" ? "Buyer address (0x...)" : "Seller address (0x...)"}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Token ID"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleAction}
          disabled={isPending || !contractAddress || !counterparty || !tokenId}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isPending ? "Signing..." : step === "approve" ? "Approve Transfer" : "Buy (Transfer to Me)"}
        </button>
      </div>

      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>Done! Tx: <code style={{ fontSize: "0.8rem" }}>{hash}</code></p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>
  );
}

export default function BuyNFTPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BuyNFTUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
