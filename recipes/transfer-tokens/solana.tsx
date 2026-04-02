"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { useState } from "react";

export function TransferNative() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleTransfer = async () => {
    if (!publicKey) return;
    setIsPending(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(to),
          lamports: Math.floor(Number(amount) * LAMPORTS_PER_SOL),
        })
      );
      const sig = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Transfer SOL</h2>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (e.g., 0.01)" />
      <button onClick={handleTransfer} disabled={isPending || !publicKey}>
        {isPending ? "Confirming..." : "Send"}
      </button>
      {txSig && <p>Transfer confirmed! Tx: {txSig}</p>}
    </div>
  );
}

export function TransferToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleTransfer = async () => {
    if (!publicKey) return;
    setIsPending(true);
    try {
      const mint = new PublicKey(mintAddress);
      const recipient = new PublicKey(to);

      const senderAta = await getAssociatedTokenAddress(mint, publicKey);
      const recipientAta = await getAssociatedTokenAddress(mint, recipient);

      const transaction = new Transaction();

      // ★ Create the recipient's token account if it doesn't exist
      try {
        await getAccount(connection, recipientAta);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipient, mint)
        );
      }

      transaction.add(
        createTransferInstruction(
          senderAta,
          recipientAta,
          publicKey,
          BigInt(amount) // Raw amount — caller handles decimals
        )
      );

      const sig = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Transfer SPL Token</h2>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint address" />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Raw amount (include decimals)" />
      <button onClick={handleTransfer} disabled={isPending || !publicKey}>
        {isPending ? "Confirming..." : "Send"}
      </button>
      {txSig && <p>Transfer confirmed! Tx: {txSig}</p>}
    </div>
  );
}
