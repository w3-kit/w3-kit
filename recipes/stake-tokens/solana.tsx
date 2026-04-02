/**
 * stake-tokens/solana.tsx
 * Native SOL staking: create stake account → delegate to validator.
 * This is protocol-agnostic native staking; liquid staking (e.g. Marinade) differs.
 */

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair, LAMPORTS_PER_SOL, PublicKey,
  StakeProgram, Transaction,
} from "@solana/web3.js";
import { useState } from "react";

// ★ Replace with the actual vote account address of your chosen validator
const VALIDATOR_VOTE_ACCOUNT_ADDRESS = "";

export function useStakeSol() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [solAmount, setSolAmount] = useState("1");
  const [status, setStatus] = useState("");

  async function handleStake() {
    if (!publicKey) return;
    if (!VALIDATOR_VOTE_ACCOUNT_ADDRESS) {
      setStatus("Error: set VALIDATOR_VOTE_ACCOUNT_ADDRESS to a valid vote account pubkey");
      return;
    }
    setStatus("Creating stake account…");

    // ★ Construct inside the handler so an invalid/placeholder address fails at
    //   runtime (with a clear error) rather than crashing at module load time
    const validatorVoteAccount = new PublicKey(VALIDATOR_VOTE_ACCOUNT_ADDRESS);

    const stakeKeypair = Keypair.generate();
    const lamports = parseFloat(solAmount) * LAMPORTS_PER_SOL;
    const rentExempt = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    );

    const tx = new Transaction().add(
      // 1. Create the stake account
      StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeKeypair.publicKey,
        authorized: { staker: publicKey, withdrawer: publicKey },
        lamports: lamports + rentExempt,
      }),
      // 2. Delegate to validator
      StakeProgram.delegate({
        stakePubkey: stakeKeypair.publicKey,
        authorizedPubkey: publicKey,
        votePubkey: validatorVoteAccount,
      })
    );

    const sig = await sendTransaction(tx, connection, {
      signers: [stakeKeypair],
    });
    await connection.confirmTransaction(sig, "confirmed");
    setStatus(`Staked! Sig: ${sig}`);
  }

  return { solAmount, setSolAmount, handleStake, status };
}
