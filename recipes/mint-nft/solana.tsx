"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { useState } from "react";

// ★ This creates an NFT the "raw SPL" way: mint with 0 decimals, supply of 1
// For full Metaplex metadata (name, image, attributes), see the .learn.md
export function MintNFT() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!publicKey) return;
    setIsPending(true);
    setError(null);
    setTxSig(null);

    try {
      // ★ Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey;

      const recipientPubkey = recipient ? new PublicKey(recipient) : publicKey;

      // Derive the Associated Token Account for the recipient
      const ata = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

      // Calculate rent for the mint account
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const tx = new Transaction().add(
        // 1. Create the mint account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPubkey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // 2. Initialize as a mint: 0 decimals = NFT
        createInitializeMintInstruction(
          mintPubkey,
          0,           // ★ 0 decimals makes it non-fungible
          publicKey,   // mint authority
          publicKey    // freeze authority
        ),
        // 3. Create the recipient's token account
        createAssociatedTokenAccountInstruction(
          publicKey,
          ata,
          recipientPubkey,
          mintPubkey
        ),
        // 4. Mint exactly 1 token — supply of 1 = NFT
        createMintToInstruction(
          mintPubkey,
          ata,
          publicKey,
          1 // ★ Supply of 1
        )
      );

      const sig = await sendTransaction(tx, connection, {
        signers: [mintKeypair], // ★ The mint keypair must co-sign
      });
      await connection.confirmTransaction(sig, "confirmed");

      setTxSig(sig);
      setMintAddress(mintPubkey.toBase58());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Mint NFT (Solana)</h2>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient (default: your wallet)"
      />
      <input
        value={metadataUri}
        onChange={(e) => setMetadataUri(e.target.value)}
        placeholder="Metadata URI (ipfs://... or https://...)"
      />
      <button onClick={handleMint} disabled={isPending || !publicKey}>
        {isPending ? "Minting..." : "Mint NFT"}
      </button>
      {txSig && <p>NFT minted! Tx: {txSig}</p>}
      {mintAddress && <p>Mint address: {mintAddress}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
