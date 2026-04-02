"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import { createApproveInstruction, createRevokeInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function ApproveUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [delegate, setDelegate] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Approve Spending (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleApprove = async () => {
    setIsPending(true);
    try {
      const mint = new PublicKey(mintAddress);
      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const tx = new Transaction().add(createApproveInstruction(ata, new PublicKey(delegate), publicKey, BigInt(amount)));
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  const handleRevoke = async () => {
    setIsPending(true);
    try {
      const mint = new PublicKey(mintAddress);
      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const tx = new Transaction().add(createRevokeInstruction(ata, publicKey));
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Approve Spending (Solana)</h2>
      <p><strong>Owner:</strong> {publicKey.toBase58()}</p>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={delegate} onChange={(e) => setDelegate(e.target.value)} placeholder="Delegate address" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Raw amount" style={{ width: "200px", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.5rem" }} />
      <div>
        <button onClick={handleApprove} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer", marginRight: "0.5rem" }}>Approve</button>
        <button onClick={handleRevoke} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#ff4444", color: "white", border: "none", borderRadius: "4px" }}>Revoke</button>
      </div>
      {txSig && <p>Done! Tx: <code style={{ fontSize: "0.8rem" }}>{txSig}</code></p>}
    </div>
  );
}

export default function ApproveSpendingPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ApproveUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
