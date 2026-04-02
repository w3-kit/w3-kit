"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useState } from "react";

export function CreateToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [decimals, setDecimals] = useState("9");
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleCreate = async () => {
    if (!publicKey) return;
    setIsPending(true);
    try {
      // ★ Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        // Create the account
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize it as a mint
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          Number(decimals),
          publicKey, // Mint authority
          publicKey, // Freeze authority
        )
      );

      // ★ The mint keypair must also sign (it's a new account being created)
      const sig = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });
      await connection.confirmTransaction(sig, "confirmed");
      setMintAddress(mintKeypair.publicKey.toBase58());
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Create SPL Token</h2>
      <p>Connected: {publicKey?.toBase58()}</p>
      <input value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="Decimals (e.g., 9)" />
      <button onClick={handleCreate} disabled={isPending || !publicKey}>
        {isPending ? "Creating..." : "Create Token"}
      </button>
      {mintAddress && <p>Token created! Mint: <code>{mintAddress}</code></p>}
    </div>
  );
}
