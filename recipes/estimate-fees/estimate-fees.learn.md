# Estimate Fees — Learn

## Gas on EVM: the basics

Every EVM operation has a fixed cost in **gas units**: storing a 32-byte word costs 20,000 gas, a simple ETH transfer costs 21,000, a token transfer around 65,000.

Gas is an abstraction over computational work. The network measures what your transaction does and charges you accordingly. Before EIP-1559, users bid a single `gasPrice` and miners picked the highest bids.

### EIP-1559: the two-component fee

London (August 2021) introduced a new fee market:

```
total cost = gasUnits × (baseFee + priorityFee)
```

**Base fee** is set algorithmically. When blocks are more than 50% full, the base fee increases by up to 12.5% for the next block. When blocks are less than 50% full, it decreases. This creates a natural equilibrium around 50% block utilization.

The base fee is **burned** — it's removed from circulation. This makes ETH deflationary when demand is high.

**Priority fee (tip)** goes directly to the validator. It's an incentive to include your transaction. During low congestion, 1–2 gwei is usually enough. During a popular NFT mint or market crash, tips can spike to hundreds of gwei.

### Why users set `maxFeePerGas`

Users don't know exactly what the base fee will be when their transaction is included (it can be multiple blocks away). So they set a ceiling: `maxFeePerGas`. The actual charge is:

```
actual fee per gas = min(baseFee + tip, maxFeePerGas)
```

If the base fee comes in lower than expected, the user gets a refund. If the base fee exceeds `maxFeePerGas - tip`, the transaction is not included until fees drop.

### Gas estimation

`estimateGas` runs the transaction as a simulation against the current state and returns how many gas units it would consume. It's accurate but not guaranteed — state can change between estimation and submission.

`estimateFeesPerGas` returns recommended values for `maxFeePerGas` and `maxPriorityFeePerGas` based on recent blocks. viem calculates these using EIP-1559 math on the latest block's base fee.

### The L2 data fee problem

On optimistic rollups (Optimism, Base, Arbitrum), every transaction has two cost components:

1. **L2 execution fee** — same EIP-1559 model, but much cheaper than L1
2. **L1 data fee** — the cost of posting calldata to Ethereum mainnet for security

The L1 data fee depends on calldata size and current L1 gas prices. A simple transfer might cost 10× more in L1 data fee than L2 execution fee. Each L2 has its own SDK for estimating this: `@eth-optimism/sdk` for OP Stack chains, Arbitrum SDK for Arbitrum.

## Compute units on Solana

Solana's equivalent of gas is **compute units (CU)**. Each instruction type costs a fixed number of CUs:

- Simple transfer: ~150 CU
- Token transfer: ~4,000 CU
- Complex DeFi instruction: up to 200,000 CU

The default compute budget is 200,000 CU per transaction. Programs can request up to 1.4M CU using `ComputeBudgetProgram.setComputeUnitLimit`.

### Solana's base fee: deterministic

Unlike EVM, Solana's base fee is not market-driven. It's a flat 5,000 lamports per signature (roughly $0.0001 at $200/SOL). This fee goes to validators.

The fee is the same whether the network is at 10% capacity or 100%. It's also tiny — the real cost pressure on Solana comes from the priority fee market.

### Priority fees: the actual market

During periods of congestion, validators prioritize transactions with higher compute unit prices. The economics:

```
priority cost = computeUnitPrice (µlamports per CU) × computeUnits / 1,000,000
```

`getRecentPrioritizationFees` returns the compute unit price from recent blocks for a given set of writable accounts. Using the writable accounts of your specific transaction gives a more accurate estimate than the global fee market — a DEX might have higher priority fees than a simple transfer.

**Percentile strategy:**
- 50th percentile (median) — balanced. Good for non-urgent transactions.
- 75th percentile — faster inclusion during normal congestion.
- 90th percentile — near-guaranteed inclusion. Use for time-sensitive ops.

### Why writable accounts matter

Solana's scheduler processes transactions in parallel, but transactions that write to the same accounts must be serialized. High-demand accounts (like a popular AMM pool) have their own localized fee market. Passing `lockedWritableAccounts` to `getRecentPrioritizationFees` gives you fees specifically for contention on those accounts.

## Displaying fees: practical guidelines

### EVM
1. Show gas price in gwei (human-readable unit, 1 gwei = 10⁻⁹ ETH)
2. Show total cost in ETH with 6 decimal places
3. Show USD equivalent using a live price feed
4. Add a "slow / standard / fast" selector that maps to different priority fee levels

### Solana
1. Base fee is always ~0.000005 SOL — worth showing but not alarming
2. Priority fee is the variable part — show it separately
3. "Total" is what users care about; break it down in an expandable section
4. For amounts < $0.001 USD, show "< $0.001" to avoid displaying meaningless precision

### Never hide fees

Show the fee estimate prominently before the user clicks "Confirm." Hiding fees until after wallet confirmation is a UX anti-pattern that erodes trust and causes transaction failures when users have insufficient balance.
