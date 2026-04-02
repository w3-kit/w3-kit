"use client";

import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton, RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { useProvideLiquidity } from "../../evm";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "provide-liquidity-demo",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});
const queryClient = new QueryClient();

function LiquidityUI() {
  const { addLiquidity, loading, error } = useProvideLiquidity();
  const [routerAddress, setRouterAddress] = useState("");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [decimalsA, setDecimalsA] = useState("18");
  const [decimalsB, setDecimalsB] = useState("18");
  const [slippage, setSlippage] = useState("50"); // basis points
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleDeposit() {
    const receipt = await addLiquidity({
      routerAddress: routerAddress as `0x${string}`,
      tokenA: tokenA as `0x${string}`,
      tokenB: tokenB as `0x${string}`,
      amountA,
      amountB,
      decimalsA: parseInt(decimalsA),
      decimalsB: parseInt(decimalsB),
      slippageBps: parseInt(slippage),
    });
    setTxHash(receipt.transactionHash);
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Provide Liquidity (EVM)</h2>
      <ConnectButton />
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Router address (0x...)" value={routerAddress} onChange={e => setRouterAddress(e.target.value)} />
        <input placeholder="Token A address (0x...)" value={tokenA} onChange={e => setTokenA(e.target.value)} />
        <input placeholder="Token B address (0x...)" value={tokenB} onChange={e => setTokenB(e.target.value)} />
        <input placeholder="Amount A" type="number" value={amountA} onChange={e => setAmountA(e.target.value)} />
        <input placeholder="Amount B" type="number" value={amountB} onChange={e => setAmountB(e.target.value)} />
        <label>
          Token A decimals:
          <input type="number" value={decimalsA} onChange={e => setDecimalsA(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <label>
          Token B decimals:
          <input type="number" value={decimalsB} onChange={e => setDecimalsB(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
        </label>
        <label>
          Slippage (basis points, e.g. 50 = 0.5%):
          <input type="number" value={slippage} onChange={e => setSlippage(e.target.value)} style={{ marginLeft: 8, width: 70 }} />
        </label>
        <button onClick={handleDeposit} disabled={loading}>
          {loading ? "Depositing..." : "Add Liquidity"}
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
          <LiquidityUI />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
