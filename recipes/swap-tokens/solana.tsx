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

// Generic swap instruction builder — replace SWAP_PROGRAM_ID with your DEX
const SWAP_PROGRAM_ID = new PublicKey("REPLACE_WITH_DEX_PROGRAM_ID");

interface SolanaSwapParams {
  tokenInMint: PublicKey;
  tokenOutMint: PublicKey;
  poolAccount: PublicKey;
  amountIn: bigint;
  minAmountOut: bigint;
}

export function useSolanaSwap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function swap(params: SolanaSwapParams) {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);
    try {
      const tx = new Transaction();

      // Ensure associated token accounts exist
      const userTokenIn = await getAssociatedTokenAddress(params.tokenInMint, publicKey);
      const userTokenOut = await getAssociatedTokenAddress(params.tokenOutMint, publicKey);

      const outAccountInfo = await connection.getAccountInfo(userTokenOut);
      if (!outAccountInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, userTokenOut, publicKey, params.tokenOutMint
          )
        );
      }

      // Generic swap instruction — data layout is DEX-specific
      const data = Buffer.alloc(17);
      data.writeUInt8(1, 0); // instruction discriminator (swap)
      data.writeBigUInt64LE(params.amountIn, 1);
      data.writeBigUInt64LE(params.minAmountOut, 9);

      tx.add(
        new TransactionInstruction({
          programId: SWAP_PROGRAM_ID,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            { pubkey: params.poolAccount, isSigner: false, isWritable: true },
            { pubkey: userTokenIn, isSigner: false, isWritable: true },
            { pubkey: userTokenOut, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          data,
        })
      );

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

  return { swap, loading, error };
}
