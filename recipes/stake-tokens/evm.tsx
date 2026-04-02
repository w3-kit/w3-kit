/**
 * stake-tokens/evm.tsx
 * Generic EVM staking pattern: approve token → call stake(amount) on staking contract.
 * Replace STAKING_ADDRESS and STAKING_ABI with your target protocol.
 */

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";

const TOKEN_ADDRESS = "0xTOKEN" as `0x${string}`;
const STAKING_ADDRESS = "0xSTAKING" as `0x${string}`;
const DECIMALS = 18;

const ERC20_ABI = [
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }] },
] as const;

const STAKING_ABI = [
  { name: "stake", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "stakedBalance", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }] },
] as const;

export function useStakeTokens() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  const { data: stakedBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract: approve, data: approveTxHash } = useWriteContract();
  const { isSuccess: approved } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContract: stake, data: stakeTxHash } = useWriteContract();
  const { isSuccess: staked, isLoading: staking } =
    useWaitForTransactionReceipt({ hash: stakeTxHash });

  function handleApprove() {
    approve({ address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: "approve",
      args: [STAKING_ADDRESS, parseUnits(amount, DECIMALS)] });
  }

  function handleStake() {
    stake({ address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: "stake",
      args: [parseUnits(amount, DECIMALS)] });
  }

  return {
    amount, setAmount,
    stakedBalance: stakedBalance ? formatUnits(stakedBalance, DECIMALS) : "0",
    handleApprove, approved,
    handleStake, staking, staked,
  };
}
