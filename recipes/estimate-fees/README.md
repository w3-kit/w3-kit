# Estimate Fees

Estimate transaction fees before sending — EIP-1559 breakdown on EVM, base + priority fees on Solana.

## What this does

Shows users what a transaction will cost before they sign. Covers the full fee model on each chain:

- **EVM:** gas units × (base fee + priority fee), formatted in gwei and ETH
- **Solana:** flat base fee (5000 lamports/signature) + optional priority fee (market-based)

## EVM vs Solana fee model

| | EVM (EIP-1559) | Solana |
|---|---|---|
| **Unit** | Gas units | Compute units (CU) |
| **Base fee** | Variable — set by the protocol, burned | Fixed — 5000 lamports per signature |
| **Priority fee** | Optional tip to validator (max priority fee) | Optional compute unit price (µLamports per CU) |
| **Total cost** | `gasUnits × (baseFee + priorityFee)` | `5000 × signatures + priorityFee` |
| **Estimation** | `estimateGas` + `estimateFeesPerGas` | `getFeeForMessage` + `getRecentPrioritizationFees` |
| **L2 note** | L2s add an L1 data fee (Optimism, Arbitrum) | N/A |

## API surface

### EVM

```ts
estimateEvmFees(
  tx: { to: `0x${string}`; data?: `0x${string}`; value?: bigint },
  from: `0x${string}`
): Promise<EvmFeeEstimate>

weiToUsd(wei: bigint, ethPriceUsd: number): string
```

Returns `{ gasUnits, baseFeePerGas, maxPriorityFeePerGas, maxFeePerGas, estimatedCostWei, estimatedCostEth }`.

### Solana

```ts
estimateSolanaFees(
  connection: Connection,
  message: TransactionMessage,
  writableAccounts: PublicKey[]
): Promise<SolanaFeeEstimate>
```

Returns `{ baseFee, priorityFee, totalFee, totalFeeSol }`.

## How to display fees to users

Show the fee in the chain's native token and in USD (requires a price feed). Format rules:

- **EVM:** show in gwei for the per-unit cost, ETH for the total. Hide sub-gwei precision.
- **Solana:** show in SOL. Most transactions cost < 0.00001 SOL — use scientific notation or a "< $0.001" label.

Always show the fee *before* the confirmation step. Hiding fees until after signing erodes trust.

## EVM: EIP-1559 explained

Since the London upgrade (EIP-1559), Ethereum uses a two-component fee:

1. **Base fee** — protocol-set, adjusts every block based on demand. This fee is burned (destroyed).
2. **Priority fee (tip)** — paid directly to the validator as an incentive to include the transaction.

Users set `maxFeePerGas` (ceiling) and `maxPriorityFeePerGas` (tip). Actual cost:
```
actual = min(baseFee + tip, maxFee) × gasUnits
```

If the base fee drops below `maxFee - tip`, the user gets a refund for the difference.

## L2 note

On Optimism and Arbitrum, there is an additional **L1 data fee** charged for posting transaction calldata to Ethereum mainnet. This is separate from the L2 execution gas and must be estimated using chain-specific SDKs (`@eth-optimism/sdk`, Arbitrum SDK). The EVM recipe covers L1 mainnet only.

## Solana: priority fees as a market

Solana's base fee is deterministic (5000 lamports per signature), but during congestion validators prioritize transactions with higher compute unit prices. The `getRecentPrioritizationFees` endpoint returns fees from recent blocks — use the median for a balanced estimate.

For time-sensitive transactions, use the 75th or 90th percentile instead of the median.

## Security notes

- Estimates are snapshots — actual fees can change between estimation and confirmation
- Always add a buffer: multiply estimated gas by 1.1–1.2x to avoid out-of-gas failures
- Never hardcode gas limits — use `estimateGas` per transaction type
- Solana: always check that the payer has enough SOL to cover rent + fees before sending

## Files

- `evm.tsx` — EVM implementation using viem `estimateGas` / `estimateFeesPerGas`
- `solana.tsx` — Solana implementation using `getFeeForMessage` + `getRecentPrioritizationFees`
- `example/evm/page.tsx` — Runnable EVM example with EIP-1559 fee breakdown
- `example/solana/page.tsx` — Runnable Solana example with base + priority fee breakdown
