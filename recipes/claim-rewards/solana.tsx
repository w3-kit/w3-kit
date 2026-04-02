/**
 * claim-rewards/solana.tsx
 * Native SOL stake reward withdrawal: deactivate → wait epoch → withdraw.
 * For DeFi protocol claims (e.g. Marinade), use their SDK instead.
 */

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey, StakeProgram, Transaction, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useState } from "react";

export function useWithdrawStake(stakeAccountPubkey: string) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState("");
  const [step, setStep] = useState<"idle" | "deactivating" | "withdrawing">("idle");

  const stakePubkey = new PublicKey(stakeAccountPubkey);

  // Step 1: Deactivate stake (must wait ~1 epoch before withdrawing)
  async function handleDeactivate() {
    if (!publicKey) return;
    setStep("deactivating");
    setStatus("Deactivating stake…");

    const tx = new Transaction().add(
      StakeProgram.deactivate({ stakePubkey, authorizedPubkey: publicKey })
    );
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    setStatus("Deactivated. Wait ~1 epoch, then withdraw.");
    setStep("withdrawing");
  }

  // Step 2: Withdraw (call after deactivation epoch has passed)
  async function handleWithdraw() {
    if (!publicKey) return;
    setStatus("Withdrawing…");

    const accountInfo = await connection.getAccountInfo(stakePubkey);
    const lamports = accountInfo?.lamports ?? 0;

    const tx = new Transaction().add(
      StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: publicKey,
        toPubkey: publicKey,
        lamports,
      })
    );
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    setStatus(`Withdrawn ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL. Sig: ${sig}`);
    setStep("idle");
  }

  return { step, status, handleDeactivate, handleWithdraw };
}
