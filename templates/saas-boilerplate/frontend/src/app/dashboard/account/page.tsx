"use client";

import { SubscriptionPayments } from "@/components/w3-kit/subscription-payments";
import { AddressBook } from "@/components/w3-kit/address-book";
import { ENSResolver } from "@/components/w3-kit/ens-resolver";
import { ContractInteraction } from "@/components/w3-kit/contract-interaction";
import { MultisigWallet } from "@/components/w3-kit/multisig-wallet";
import { MOCK_ADDRESSES } from "@/data/account";

const MOCK_ADDRESS_ENTRIES = MOCK_ADDRESSES.map((a, i) => ({
  id: `addr-${i}`,
  name: a.name,
  address: a.address,
  notes: a.label,
}));

const MOCK_SIGNERS = [
  { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", name: "Owner", hasApproved: true },
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", name: "Signer 2", hasApproved: false },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", name: "Signer 3", hasApproved: false },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    token: { symbol: "USDC", logoURI: "", decimals: 6 },
    interval: "monthly" as const,
    features: ["5 Token Launches", "Basic Analytics", "Community Support"],
    description: "Get started with token launches",
    icon: "sparkles" as const,
  },
  {
    id: "pro",
    name: "Pro",
    price: "49",
    token: { symbol: "USDC", logoURI: "", decimals: 6 },
    interval: "monthly" as const,
    features: ["Unlimited Launches", "Advanced Analytics", "Vesting Schedules", "Airdrop Tools", "Priority Support"],
    description: "For serious token launchers",
    icon: "zap" as const,
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "199",
    token: { symbol: "USDC", logoURI: "", decimals: 6 },
    interval: "monthly" as const,
    features: ["Everything in Pro", "Custom Contracts", "White-label", "Dedicated Support", "SLA"],
    description: "For teams and organizations",
    icon: "shield" as const,
  },
];

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Account</h1>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Subscription & Billing</h2>
        <SubscriptionPayments plans={PLANS} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Address Book</h2>
          <AddressBook entries={MOCK_ADDRESS_ENTRIES} />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">ENS Resolver</h2>
          <ENSResolver />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Contract Interaction</h2>
          <ContractInteraction />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Multi-sig Wallet</h2>
          <MultisigWallet
            walletAddress="0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"
            signers={MOCK_SIGNERS}
            transactions={[]}
            requiredApprovals={2}
          />
        </section>
      </div>
    </div>
  );
}
