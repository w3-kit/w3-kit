export const MOCK_STAKING_POOLS = [
  {
    id: "pool-1",
    name: "LAUNCH Staking",
    token: { symbol: "LAUNCH", logoURI: "", decimals: 18 },
    apr: 12.5,
    minStake: "100",
    lockPeriod: 30,
    totalStaked: "15000000",
  },
  {
    id: "pool-2",
    name: "ETH Staking",
    token: { symbol: "ETH", logoURI: "", decimals: 18 },
    apr: 4.2,
    minStake: "0.1",
    lockPeriod: 0,
    totalStaked: "52000",
  },
  {
    id: "pool-3",
    name: "USDC Lending",
    token: { symbol: "USDC", logoURI: "", decimals: 6 },
    apr: 6.8,
    minStake: "100",
    lockPeriod: 7,
    totalStaked: "8500000",
  },
];

export const MOCK_LIQUIDITY_POOLS = [
  {
    id: "lp-1",
    name: "LAUNCH/ETH",
    token0: { symbol: "LAUNCH", logoURI: "" },
    token1: { symbol: "ETH", logoURI: "" },
    tvl: 4500000,
    volume24h: 1200000,
    apr: 18.5,
    fees24h: 3600,
  },
  {
    id: "lp-2",
    name: "USDC/ETH",
    token0: { symbol: "USDC", logoURI: "" },
    token1: { symbol: "ETH", logoURI: "" },
    tvl: 12000000,
    volume24h: 8500000,
    apr: 8.2,
    fees24h: 25500,
  },
];

export const MOCK_DEFI_POSITIONS = [
  {
    id: "pos-1",
    protocol: "Uniswap V3",
    type: "Liquidity",
    tokens: ["LAUNCH", "ETH"],
    value: 15000,
    pnl: 1200,
    healthFactor: 0,
  },
  {
    id: "pos-2",
    protocol: "Aave",
    type: "Lending",
    tokens: ["USDC"],
    value: 10000,
    pnl: 340,
    healthFactor: 2.1,
  },
  {
    id: "pos-3",
    protocol: "Compound",
    type: "Borrowing",
    tokens: ["ETH"],
    value: 5000,
    pnl: -120,
    healthFactor: 1.5,
  },
];
