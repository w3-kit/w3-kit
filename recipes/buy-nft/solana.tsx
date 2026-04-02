"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { useState } from "react";

// ★ Transfer NFT from the connected wallet to a recipient address.
// On Solana, NFTs are SPL tokens with 0 decimals and a supply of 1.
// The connected wallet must own the NFT and signs the transaction.
//
// NOTE: Real marketplace "buy" flows (Magic Eden, Tensor) use escrow
// programs so the seller and buyer can swap atomically without trusting
// each other. This recipe shows the raw SPL transfer only — useful when
// you want to gift or move your own NFT.
export function TransferNFT() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!publicKey) return;
    setIsPending(true);
    setError(null);
    setTxSig(null);

    try {
      const mint = new PublicKey(mintAddress);
      const recipient = new PublicKey(recipientAddress);

      // ★ Source: connected wallet's ATA for this NFT mint (the wallet signs)
      const senderAta = await getAssociatedTokenAddress(mint, publicKey);
      // ★ Destination: recipient's ATA (may need to be created first)
      const recipientAta = await getAssociatedTokenAddress(mint, recipient);

      const tx = new Transaction();

      // Create recipient's ATA if it doesn't exist yet
      try {
        await getAccount(connection, recipientAta);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipient, mint)
        );
      }

      // ★ Transfer the 1 NFT token — connected wallet (publicKey) is the authority
      tx.add(
        createTransferInstruction(
          senderAta,
          recipientAta,
          publicKey, // ★ signer = connected wallet (the NFT owner)
          1          // transfer 1 NFT
        )
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Transfer NFT (Solana)</h2>
      <p><em>Transfers an NFT you own to another wallet. You must hold the NFT in your connected wallet.</em></p>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="NFT mint address" />
      <input value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Recipient wallet address" />
      <button onClick={handleTransfer} disabled={isPending || !publicKey}>
        {isPending ? "Transferring..." : "Transfer NFT"}
      </button>
      {txSig && <p>Transfer complete! Tx: {txSig}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
