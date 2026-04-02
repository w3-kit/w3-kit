"use client";

import { useState, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useSolanaSwap } from "../../solana";
import "@solana/wallet-adapter-react-ui/styles.css";

const ENDPOINT = "https://api.mainnet-beta.solana.com";

function SwapUI() {
  const { swap, loading, error } = useSolanaSwap();
  const [tokenInMint, setTokenInMint] = useState("");
  const [tokenOutMint, setTokenOutMint] = useState("");
  const [poolAccount, setPoolAccount] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [sig, setSig] = useState<string | null>(null);

  async function handleSwap() {
    const amountInLamports = BigInt(Math.floor(parseFloat(amountIn) * 1e9));
    const minOut = BigInt(
      Math.floor(Number(amountInLamports) * (1 - parseFloat(slippage) / 100))
    );
    const signature = await swap({
      tokenInMint: new PublicKey(tokenInMint),
      tokenOutMint: new PublicKey(tokenOutMint),
      poolAccount: new PublicKey(poolAccount),
      amountIn: amountInLamports,
      minAmountOut: minOut,
    });
    setSig(signature);
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Swap Tokens (Solana)</h2>
      <WalletMultiButton />
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Token In mint address" value={tokenInMint} onChange={e => setTokenInMint(e.target.value)} />
        <input placeholder="Token Out mint address" value={tokenOutMint} onChange={e => setTokenOutMint(e.target.value)} />
        <input placeholder="Pool account address" value={poolAccount} onChange={e => setPoolAccount(e.target.value)} />
        <input placeholder="Amount In (tokens)" type="number" value={amountIn} onChange={e => setAmountIn(e.target.value)} />
        <label>
          Slippage tolerance (%):
          <input type="number" value={slippage} onChange={e => setSlippage(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <button onClick={handleSwap} disabled={loading}>
          {loading ? "Swapping..." : "Swap"}
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
          <SwapUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
