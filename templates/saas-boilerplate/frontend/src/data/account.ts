export const MOCK_ADDRESSES = [
  { name: "Treasury", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", label: "Main Treasury" },
  { name: "Team Multi-sig", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", label: "3/5 Multi-sig" },
  { name: "Marketing Wallet", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", label: "Marketing" },
  { name: "Dev Fund", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", label: "Development" },
];

export const MOCK_SUBSCRIPTIONS = {
  plans: [
    { name: "Free", price: "0", features: ["5 Token Launches", "Basic Analytics", "Community Support"] },
    { name: "Pro", price: "49", features: ["Unlimited Launches", "Advanced Analytics", "Vesting Schedules", "Airdrop Tools", "Priority Support"] },
    { name: "Enterprise", price: "199", features: ["Everything in Pro", "Custom Contracts", "White-label", "Dedicated Support", "SLA"] },
  ],
  currentPlan: "Pro",
};
