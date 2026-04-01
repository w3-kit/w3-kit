"use client";

import StatCard from "@/components/StatCard";
import { PriceTicker } from "@/components/w3-kit/price-ticker";
import { WalletBalance } from "@/components/w3-kit/wallet-balance";
import { TransactionHistory } from "@/components/w3-kit/transaction-history";
import { GasCalculator } from "@/components/w3-kit/gas-calculator";
import { Wallet, Rocket, TrendingUp, Gift } from "lucide-react";
import { MOCK_TRANSACTIONS } from "@/data/transactions";

const WALLET_TOKENS = [
  { symbol: "ETH", name: "Ethereum", balance: "4.2", price: 3245.67, decimals: 18, logoURI: "", priceChange24h: 2.34 },
  { symbol: "USDC", name: "USD Coin", balance: "12500", price: 1.0, decimals: 6, logoURI: "", priceChange24h: 0.01 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", price: 67234.0, decimals: 8, logoURI: "", priceChange24h: -1.2 },
  { symbol: "UNI", name: "Uniswap", balance: "500", price: 7.85, decimals: 18, logoURI: "", priceChange24h: 5.4 },
];

const PRICE_TICKER_TOKENS = [
  {
    name: "Ethereum",
    symbol: "ETH",
    price: 3245.67,
    priceChange: { "1h": 0.5, "24h": 2.34, "7d": 5.1, "30d": 12.3 },
    marketCap: 390000000000,
    volume: { "24h": 14500000000 },
    circulatingSupply: 120000000,
    maxSupply: null,
    logoURI: "",
    lastUpdated: new Date().toISOString(),
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    price: 1.0,
    priceChange: { "1h": 0.0, "24h": 0.01, "7d": 0.0, "30d": 0.0 },
    marketCap: 32000000000,
    volume: { "24h": 5200000000 },
    circulatingSupply: 32000000000,
    maxSupply: null,
    logoURI: "",
    lastUpdated: new Date().toISOString(),
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    price: 67234.0,
    priceChange: { "1h": -0.2, "24h": -1.2, "7d": 3.4, "30d": 8.7 },
    marketCap: 1320000000000,
    volume: { "24h": 28000000000 },
    circulatingSupply: 19600000,
    maxSupply: 21000000,
    logoURI: "",
    lastUpdated: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Portfolio Value" value="$51,205.91" change="+3.2% today" icon={<Wallet size={18} />} />
        <StatCard title="Tokens Launched" value="3" change="+1 this week" icon={<Rocket size={18} />} />
        <StatCard title="Active Staking" value="$23,500" change="+12.5% APR" icon={<TrendingUp size={18} />} />
        <StatCard title="Pending Airdrops" value="1,800" change="3,200 / 5,000 distributed" icon={<Gift size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PriceTicker tokens={PRICE_TICKER_TOKENS as any} />
        </div>
        <div>
          <WalletBalance tokens={WALLET_TOKENS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TransactionHistory transactions={MOCK_TRANSACTIONS as any} />
        </div>
        <div>
          <GasCalculator />
        </div>
      </div>
    </div>
  );
}
