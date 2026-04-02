/**
 * claim-rewards/evm.tsx
 * Generic EVM reward-claim pattern: read pendingRewards → call claim/harvest.
 * Replace STAKING_ADDRESS and STAKING_ABI with your target protocol.
 */

import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract,
         useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";

const STAKING_ADDRESS = "0xSTAKING" as `0x${string}`;
const REWARD_DECIMALS = 18;

const STAKING_ABI = [
  { name: "pendingRewards", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }] },
  { name: "claim", type: "function", stateMutability: "nonpayable",
    inputs: [], outputs: [] },
] as const;

export function useClaimRewards() {
  const { address } = useAccount();

  const { data: pending, refetch } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: claiming, isSuccess: claimed } =
    useWaitForTransactionReceipt({ hash: txHash });

  function handleClaim() {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "claim",
    });
  }

  // Refresh pending balance after successful claim
  useEffect(() => { if (claimed) refetch(); }, [claimed, refetch]);

  return {
    pendingRewards: pending ? formatUnits(pending, REWARD_DECIMALS) : "0",
    handleClaim,
    claiming,
    claimed,
  };
}
