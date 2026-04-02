"use client";

import { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function BalanceUI() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    connection.getBalance(publicKey).then((lamports) => {
      setSolBalance(lamports / LAMPORTS_PER_SOL);
    });
  }, [connection, publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    setTokenError(null);
    (async () => {
      try {
        const mint = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        const account = await getAccount(connection, ata);
        setTokenBalance(account.amount.toString());
      } catch {
        setTokenError("No token account found");
        setTokenBalance(null);
      }
    })();
  }, [connection, publicKey, mintAddress]);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Get Balance (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Get Balance (Solana)</h2>
      <p><strong>Address:</strong> {publicKey.toBase58()}</p>

      <div style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Native Balance</h3>
        <p>{solBalance !== null ? `${solBalance} SOL` : "Loading..."}</p>
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <h3>SPL Token Balance</h3>
        <input
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", fontSize: "0.8rem" }}
          placeholder="Token mint address"
        />
        {tokenError && <p style={{ color: "orange" }}>{tokenError}</p>}
        {tokenBalance !== null && <p>Balance: {tokenBalance} (raw amount)</p>}
      </div>
    </div>
  );
}

export default function GetBalancePage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BalanceUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
