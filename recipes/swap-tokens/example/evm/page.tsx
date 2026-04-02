"use client";

import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton, RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { useSwapTokens } from "../../evm";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "swap-tokens-demo",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});
const queryClient = new QueryClient();

function SwapUI() {
  const { swap, loading, error } = useSwapTokens();
  const [routerAddress, setRouterAddress] = useState("");
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [decimalsIn, setDecimalsIn] = useState("18");
  const [decimalsOut, setDecimalsOut] = useState("18");
  const [slippage, setSlippage] = useState("0.5");
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleSwap() {
    // amountOutMin derived from amountIn and slippage for demo purposes
    const amountOutMin = (
      parseFloat(amountIn) * (1 - parseFloat(slippage) / 100)
    ).toFixed(6);

    const receipt = await swap({
      routerAddress: routerAddress as `0x${string}`,
      tokenIn: tokenIn as `0x${string}`,
      tokenOut: tokenOut as `0x${string}`,
      amountIn,
      amountOutMin,
      decimalsIn: parseInt(decimalsIn),
      decimalsOut: parseInt(decimalsOut),
    });
    setTxHash(receipt.transactionHash);
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Swap Tokens (EVM)</h2>
      <ConnectButton />
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Router address (0x...)" value={routerAddress} onChange={e => setRouterAddress(e.target.value)} />
        <input placeholder="Token In address (0x...)" value={tokenIn} onChange={e => setTokenIn(e.target.value)} />
        <input placeholder="Token Out address (0x...)" value={tokenOut} onChange={e => setTokenOut(e.target.value)} />
        <input placeholder="Amount In" type="number" value={amountIn} onChange={e => setAmountIn(e.target.value)} />
        <label>
          Token In decimals:
          <input type="number" value={decimalsIn} onChange={e => setDecimalsIn(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <label>
          Token Out decimals:
          <input type="number" value={decimalsOut} onChange={e => setDecimalsOut(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <label>
          Slippage tolerance (%):
          <input type="number" value={slippage} onChange={e => setSlippage(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <button onClick={handleSwap} disabled={loading}>
          {loading ? "Swapping..." : "Swap"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {txHash && <p>Tx: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">{txHash.slice(0, 18)}...</a></p>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SwapUI />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
