"use client";

import { useState, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useSolanaProvideLiquidity } from "../../solana";
import "@solana/wallet-adapter-react-ui/styles.css";

const ENDPOINT = "https://api.mainnet-beta.solana.com";

function LiquidityUI() {
  const { addLiquidity, loading, error } = useSolanaProvideLiquidity();
  const [tokenAMint, setTokenAMint] = useState("");
  const [tokenBMint, setTokenBMint] = useState("");
  const [lpMint, setLpMint] = useState("");
  const [poolTokenAAccount, setPoolTokenAAccount] = useState("");
  const [poolTokenBAccount, setPoolTokenBAccount] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [minLp, setMinLp] = useState("0");
  const [sig, setSig] = useState<string | null>(null);

  async function handleDeposit() {
    const signature = await addLiquidity({
      tokenAMint: new PublicKey(tokenAMint),
      tokenBMint: new PublicKey(tokenBMint),
      lpMint: new PublicKey(lpMint),
      poolTokenAAccount: new PublicKey(poolTokenAAccount),
      poolTokenBAccount: new PublicKey(poolTokenBAccount),
      amountA: BigInt(Math.floor(parseFloat(amountA) * 1e9)),
      amountB: BigInt(Math.floor(parseFloat(amountB) * 1e9)),
      minLpTokens: BigInt(minLp),
    });
    setSig(signature);
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Provide Liquidity (Solana)</h2>
      <WalletMultiButton />
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Token A mint" value={tokenAMint} onChange={e => setTokenAMint(e.target.value)} />
        <input placeholder="Token B mint" value={tokenBMint} onChange={e => setTokenBMint(e.target.value)} />
        <input placeholder="LP token mint" value={lpMint} onChange={e => setLpMint(e.target.value)} />
        <input placeholder="Pool Token A account" value={poolTokenAAccount} onChange={e => setPoolTokenAAccount(e.target.value)} />
        <input placeholder="Pool Token B account" value={poolTokenBAccount} onChange={e => setPoolTokenBAccount(e.target.value)} />
        <input placeholder="Amount A (tokens)" type="number" value={amountA} onChange={e => setAmountA(e.target.value)} />
        <input placeholder="Amount B (tokens)" type="number" value={amountB} onChange={e => setAmountB(e.target.value)} />
        <input placeholder="Min LP tokens out (0 for demo)" type="number" value={minLp} onChange={e => setMinLp(e.target.value)} />
        <button onClick={handleDeposit} disabled={loading}>
          {loading ? "Depositing..." : "Add Liquidity"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {sig && <p>Signature: <a href={`https://solscan.io/tx/${sig}`} target="_blank">{sig.slice(0, 18)}...</a></p>}
      </div>
    </div>
  );
}

export default function Page() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LiquidityUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
