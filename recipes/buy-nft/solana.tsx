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

// ★ On Solana, NFT "buying" is a token account transfer
// Real marketplaces (Magic Eden, Tensor) use escrow programs
// This shows the underlying transfer pattern
export function BuyNFT() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!publicKey) return;
    setIsPending(true);
    setError(null);
    setTxSig(null);

    try {
      const mint = new PublicKey(mintAddress);
      const seller = new PublicKey(sellerAddress);

      // ★ Source: seller's ATA for this NFT mint
      const sellerAta = await getAssociatedTokenAddress(mint, seller);
      // ★ Destination: buyer's ATA (may need to be created)
      const buyerAta = await getAssociatedTokenAddress(mint, publicKey);

      const tx = new Transaction();

      // Create buyer's ATA if it doesn't exist
      try {
        await getAccount(connection, buyerAta);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(publicKey, buyerAta, publicKey, mint)
        );
      }

      // ★ Transfer the 1 NFT token from seller to buyer
      // NOTE: The seller must have approved this transaction (signed off-chain)
      // In practice this is handled by marketplace escrow programs
      tx.add(
        createTransferInstruction(
          sellerAta,
          buyerAta,
          seller, // ★ seller must be the signer (or an approved delegate)
          1       // transfer 1 NFT
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
      <h2>Buy NFT (Solana)</h2>
      <p><em>Demonstrates the transfer pattern. Real buying requires marketplace escrow.</em></p>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="NFT mint address" />
      <input value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} placeholder="Seller wallet address" />
      <button onClick={handleBuy} disabled={isPending || !publicKey}>
        {isPending ? "Processing..." : "Transfer NFT to Me"}
      </button>
      {txSig && <p>Transfer complete! Tx: {txSig}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
