"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function CreateTokenUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [decimals, setDecimals] = useState("9");
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Create Token (Solana)</h2>
        <p>Connect to Devnet to test token creation (free).</p>
        <WalletMultiButton />
      </div>
    );
  }

  const handleCreate = async () => {
    setIsPending(true);
    setMintAddress(null);
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
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Create Token (Solana)</h2>
      <p><strong>Connected:</strong> {publicKey.toBase58()}</p>
      <div style={{ margin: "1rem 0" }}>
        <label>Decimals: </label>
        <input value={decimals} onChange={(e) => setDecimals(e.target.value)} style={{ width: "60px", padding: "0.5rem", fontFamily: "monospace" }} />
      </div>
      <button onClick={handleCreate} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        {isPending ? "Creating..." : "Create SPL Token"}
      </button>
      {mintAddress && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid green", background: "#f0fff0" }}>
          <p><strong>Token created!</strong></p>
          <p>Mint: <code style={{ fontSize: "0.8rem" }}>{mintAddress}</code></p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>You are the mint authority and freeze authority.</p>
        </div>
      )}
    </div>
  );
}

export default function CreateTokenPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CreateTokenUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
