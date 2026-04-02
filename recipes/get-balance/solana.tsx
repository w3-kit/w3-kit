"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { useEffect, useState } from "react";

export function GetNativeBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    connection.getBalance(publicKey).then((lamports) => {
      setBalance(lamports / LAMPORTS_PER_SOL);
    });
  }, [connection, publicKey]);

  return (
    <div>
      <h2>Native Balance</h2>
      <p>{balance !== null ? `${balance} SOL` : "Loading..."}</p>
    </div>
  );
}

export function GetTokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC on Solana
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    setError(null);
    (async () => {
      try {
        const mint = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        const account = await getAccount(connection, ata);
        setBalance(account.amount.toString());
      } catch {
        setError("No token account found (balance is 0 or account doesn't exist)");
        setBalance(null);
      }
    })();
  }, [connection, publicKey, mintAddress]);

  return (
    <div>
      <h2>SPL Token Balance</h2>
      <input
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        placeholder="Token mint address"
      />
      {error && <p style={{ color: "orange" }}>{error}</p>}
      {balance !== null && <p>Balance: {balance} (raw amount)</p>}
    </div>
  );
}
