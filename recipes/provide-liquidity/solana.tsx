import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Generic liquidity deposit — replace with your AMM program ID
const LIQUIDITY_PROGRAM_ID = new PublicKey("REPLACE_WITH_AMM_PROGRAM_ID");

interface SolanaAddLiquidityParams {
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  lpMint: PublicKey;
  poolTokenAAccount: PublicKey;
  poolTokenBAccount: PublicKey;
  amountA: bigint;
  amountB: bigint;
  minLpTokens: bigint;
}

export function useSolanaProvideLiquidity() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addLiquidity(params: SolanaAddLiquidityParams) {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);
    try {
      const tx = new Transaction();

      const userTokenA = await getAssociatedTokenAddress(params.tokenAMint, publicKey);
      const userTokenB = await getAssociatedTokenAddress(params.tokenBMint, publicKey);
      const userLpAccount = await getAssociatedTokenAddress(params.lpMint, publicKey);

      // Create LP token account if it doesn't exist
      const lpInfo = await connection.getAccountInfo(userLpAccount);
      if (!lpInfo) {
        tx.add(createAssociatedTokenAccountInstruction(
          publicKey, userLpAccount, publicKey, params.lpMint
        ));
      }

      // Generic deposit instruction (layout is AMM-specific)
      const data = Buffer.alloc(25);
      data.writeUInt8(2, 0); // instruction discriminator (deposit)
      data.writeBigUInt64LE(params.amountA, 1);
      data.writeBigUInt64LE(params.amountB, 9);
      data.writeBigUInt64LE(params.minLpTokens, 17);

      tx.add(new TransactionInstruction({
        programId: LIQUIDITY_PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: params.poolTokenAAccount, isSigner: false, isWritable: true },
          { pubkey: params.poolTokenBAccount, isSigner: false, isWritable: true },
          { pubkey: userTokenA, isSigner: false, isWritable: true },
          { pubkey: userTokenB, isSigner: false, isWritable: true },
          { pubkey: userLpAccount, isSigner: false, isWritable: true },
          { pubkey: params.lpMint, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data,
      }));

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      return sig;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { addLiquidity, loading, error };
}
