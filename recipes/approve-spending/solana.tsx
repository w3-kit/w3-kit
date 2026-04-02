"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createApproveInstruction, createRevokeInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { useState } from "react";

export function ApproveSpending() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [delegate, setDelegate] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    if (!publicKey) return;
    setIsPending(true);
    try {
      const mint = new PublicKey(mintAddress);
      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const tx = new Transaction().add(
        createApproveInstruction(ata, new PublicKey(delegate), publicKey, BigInt(amount))
      );
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!publicKey) return;
    setIsPending(true);
    try {
      const mint = new PublicKey(mintAddress);
      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const tx = new Transaction().add(
        createRevokeInstruction(ata, publicKey)
      );
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Approve Token Spending (Delegate)</h2>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint address" />
      <input value={delegate} onChange={(e) => setDelegate(e.target.value)} placeholder="Delegate address" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Raw amount" />
      <button onClick={handleApprove} disabled={isPending || !publicKey}>Approve</button>
      <button onClick={handleRevoke} disabled={isPending || !publicKey}>Revoke</button>
      {txSig && <p>Done! Tx: {txSig}</p>}
    </div>
  );
}
