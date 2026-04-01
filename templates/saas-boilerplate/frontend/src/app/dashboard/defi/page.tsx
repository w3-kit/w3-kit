"use client";

import { AssetPortfolio } from "@/components/w3-kit/asset-portfolio";
import { DeFiPositionManager } from "@/components/w3-kit/defi-position-manager";
import { StakingInterface } from "@/components/w3-kit/staking-interface";
import { LiquidityPoolStats } from "@/components/w3-kit/liquidity-pool-stats";
import { FlashLoanExecutor } from "@/components/w3-kit/flash-loan-executor";
// SmartContractScanner temporarily disabled — component has a JSX parsing issue
// import { SmartContractScanner } from "@/components/w3-kit/smart-contract-scanner";
import { MOCK_STAKING_POOLS } from "@/data/defi";

const MOCK_ASSETS = [
  {
    symbol: "ETH",
    balance: "4.2",
    price: 3245.67,
    value: 13631.81,
    change24h: 2.34,
    color: "#627EEA",
    tokenConfig: { symbol: "ETH", logoURI: "", decimals: 18 },
    priceHistory: { "24h": [3100, 3200, 3245], "7d": [3000, 3100, 3245], "30d": [2800, 3000, 3245] },
  },
  {
    symbol: "USDC",
    balance: "12500",
    price: 1.0,
    value: 12500,
    change24h: 0.01,
    color: "#2775CA",
    tokenConfig: { symbol: "USDC", logoURI: "", decimals: 6 },
    priceHistory: { "24h": [1, 1, 1], "7d": [1, 1, 1], "30d": [1, 1, 1] },
  },
];

const MOCK_POSITIONS = [
  {
    id: "pos-1",
    protocol: { name: "Aave", logoURI: "", type: "lending" as const },
    token: { symbol: "USDC", logoURI: "", price: 1.0 },
    amount: "10000",
    value: 10000,
    healthFactor: 2.1,
    apy: 5.2,
    rewards: [],
  },
];

const MOCK_POOL_DATA = {
  token: { symbol: "LAUNCH/ETH", logoURI: "", decimals: 18, address: "0x0", chainId: 1, name: "LAUNCH/ETH LP" },
  fee: 0.3,
  tvl: 4500000,
  tvlChange24h: 2.1,
  volume24h: 1200000,
  volumeChange24h: 5.4,
  apr: 18.5,
  feesEarned24h: 3600,
  uniqueHolders: 1240,
  transactions24h: 842,
};

const MOCK_FLASH_PROTOCOLS = [
  { name: "Aave", logoURI: "", address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9" },
  { name: "dYdX", logoURI: "", address: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e" },
];

const MOCK_FLASH_TOKENS = [
  { symbol: "USDC", logoURI: "", decimals: 6, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { symbol: "ETH", logoURI: "", decimals: 18, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
];

export default function DefiPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">DeFi</h1>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Portfolio</h2>
        <AssetPortfolio assets={MOCK_ASSETS as any} totalValue={26131.81} totalChange24h={2.1} />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Active Positions</h2>
        <DeFiPositionManager positions={MOCK_POSITIONS as any} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Staking</h2>
          <StakingInterface pools={MOCK_STAKING_POOLS as any} />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Liquidity Pools</h2>
          <LiquidityPoolStats poolData={MOCK_POOL_DATA as any} />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Flash Loans</h2>
          <FlashLoanExecutor protocols={MOCK_FLASH_PROTOCOLS} tokens={MOCK_FLASH_TOKENS} />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Contract Audit</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
            Smart Contract Scanner — coming soon
          </div>
        </section>
      </div>
    </div>
  );
}
