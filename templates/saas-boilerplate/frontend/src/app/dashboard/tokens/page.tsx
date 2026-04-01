"use client";

import { TokenList } from "@/components/w3-kit/token-list";
import { TokenCard } from "@/components/w3-kit/token-card";
import { TokenVesting } from "@/components/w3-kit/token-vesting";
import { TokenAirdrop } from "@/components/w3-kit/token-airdrop";
import { MOCK_TOKENS } from "@/data/tokens";

const MOCK_VESTING_SCHEDULES = [
  {
    id: "vest-1",
    tokenSymbol: "LAUNCH",
    totalAmount: "10000000",
    vestedAmount: "2500000",
    startDate: 1735689600000,
    endDate: 1798761600000,
    cliffDate: 1751328000000,
    lastClaimDate: null,
    beneficiary: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
    status: "active" as const,
  },
];

const MOCK_AIRDROPS = [
  {
    id: "airdrop-1",
    tokenSymbol: "LAUNCH",
    tokenName: "Token Launchpad",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    amount: "1800",
    merkleRoot: "0xabc123",
    merkleProof: [],
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 86400000 * 30,
    claimed: false,
  },
];

export default function TokensPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Token Management</h1>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Your Tokens</h2>
        <TokenList tokens={MOCK_TOKENS as any} showPrices showBalances />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Featured Token</h2>
        <div className="max-w-md">
          <TokenCard token={MOCK_TOKENS[0] as any} showBalance showPrice showPriceChange />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Vesting Schedules</h2>
        <TokenVesting vestingSchedules={MOCK_VESTING_SCHEDULES} onClaimTokens={async () => {}} />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Airdrop Manager</h2>
        <TokenAirdrop airdrops={MOCK_AIRDROPS} onClaim={async () => {}} />
      </section>
    </div>
  );
}
