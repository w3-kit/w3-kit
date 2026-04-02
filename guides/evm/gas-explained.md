# Gas Explained — EVM Fee Mechanics From First Principles

Gas is the unit of computational work on EVM-compatible blockchains. It is not ETH — it is a measure of how much work a transaction requires. You pay for that work in ETH (or the native token of the chain).

---

## What is gas?

Every operation the EVM executes costs a fixed number of gas units:

| Opcode | Gas cost | What it does |
|---|---|---|
| `ADD` | 3 | Integer addition |
| `MUL` | 5 | Integer multiplication |
| `SLOAD` | 2,100 | Read a storage slot (cold) |
| `SSTORE` | 20,000 | Write to a new storage slot |
| `CALL` | 2,600 | Call another contract (cold) |
| Base tx cost | 21,000 | Minimum cost for any transaction |

A simple ETH transfer costs exactly 21,000 gas. A complex DeFi swap might cost 150,000–300,000 gas. A gas unit has no monetary value by itself — the fee depends on the current gas price.

---

## Legacy gas pricing (pre-EIP-1559)

Before the London fork (August 2021), every transaction specified a single `gasPrice`:

```
fee = gasPrice × gasUsed
```

Users bid against each other. Miners included the highest-paying transactions first. During congestion, users had to guess the right `gasPrice` — too low meant your transaction got stuck for hours.

---

## EIP-1559: the current model

EIP-1559 replaced the single `gasPrice` with a two-component model:

```
fee = (baseFeePerGas + maxPriorityFeePerGas) × gasUsed
```

**`baseFeePerGas`** — set by the protocol, not by the user. It adjusts automatically: increases when the previous block was more than 50% full, decreases when it was less than 50% full. It is **burned** (removed from supply).

**`maxPriorityFeePerGas`** — the tip you offer to validators. Goes directly to the validator who includes your transaction. Typical values: 0.1–2 gwei on mainnet.

**`maxFeePerGas`** — the absolute maximum per gas unit you are willing to pay. The actual fee will never exceed this. Any unused headroom is refunded:

```
refund = (maxFeePerGas - baseFeePerGas - priorityFee) × gasUsed
```

### Reading the base fee in Solidity

```solidity
// Available since Solidity 0.8.7
uint256 currentBaseFee = block.basefee;
```

### Estimating fees with viem

```ts
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({ chain: mainnet, transport: http() });

// Returns baseFeePerGas, maxFeePerGas, maxPriorityFeePerGas
const fees = await client.estimateFeesPerGas();

// Estimate gas for a specific call
const gas = await client.estimateGas({
  account: "0xYourAddress",
  to: "0xContractAddress",
  data: "0x...",
});

console.log({
  baseFee: fees.baseFeePerGas,         // bigint (wei)
  maxFee: fees.maxFeePerGas,           // baseFee * 2 + priorityFee (viem default)
  priorityFee: fees.maxPriorityFeePerGas,
  gasUnits: gas,
  estimatedCostWei: fees.maxFeePerGas * gas,
});
```

### Sending a transaction with explicit fee caps

```ts
const hash = await walletClient.sendTransaction({
  to: "0xRecipient",
  value: parseEther("0.01"),
  maxFeePerGas: parseGwei("20"),          // your hard cap
  maxPriorityFeePerGas: parseGwei("1"),   // validator tip
  gas: 21000n,
});
```

---

## Gas limit

The `gas` field on a transaction is the **limit** — the maximum gas units the sender allows this transaction to consume. If execution requires more gas than the limit:

- The transaction **reverts** (state changes rolled back)
- The fee is **still charged** (validators were paid for the work done)
- You lose `gasLimit × gasPrice` worth of ETH

Set the gas limit too high and you waste nothing — unused gas is not charged. Setting it too low causes a failed transaction. Always use `estimateGas` before sending.

---

## Block gas limit

The protocol sets a per-block gas limit (~30 million gas on Ethereum mainnet). This caps how many transactions fit in one block. The base fee adjusts to keep blocks roughly 50% full on average (the "target" is 15M gas per block).

---

## Gas on L2s

Layer 2 networks use gas too, but the cost structure has two components:

**Optimistic Rollups (Optimism, Arbitrum, Base):**
```
total fee = L2 execution fee + L1 data fee
```
The L1 data fee covers posting your transaction's calldata to Ethereum mainnet as a blob. Compressing calldata reduces this fee significantly.

**ZK Rollups (zkSync, Starknet, Polygon zkEVM):**
```
total fee = L2 execution fee + proof amortization cost
```
The proof cost is shared across all transactions in a batch. In practice, L2 fees are 10–100x cheaper than mainnet.

---

## Optimization tips

**Pack storage variables.** The EVM storage slot is 32 bytes. Multiple smaller variables can share one slot:

```solidity
// Bad: 3 separate 32-byte slots (60,000 gas for 3 SSTOREs)
uint256 a;
uint256 b;
uint256 c;

// Good: all packed into one 32-byte slot (20,000 gas for 1 SSTORE)
uint128 a;
uint64  b;
uint64  c;
```

**Use `calldata` instead of `memory` for read-only args.** `calldata` is cheaper because it is not copied:

```solidity
// Expensive: copies array into memory
function process(uint256[] memory ids) external { ... }

// Cheaper: reads directly from calldata
function process(uint256[] calldata ids) external { ... }
```

**Use `unchecked {}` for math that cannot overflow:**

```solidity
// Overflow check costs ~3 extra gas per operation
for (uint256 i = 0; i < length; ) {
    // do work
    unchecked { ++i; } // safe: i < length guarantees no overflow
}
```

**Avoid on-chain storage when events suffice.** Emitting an event costs ~375 gas + 8 gas per non-zero byte. Writing to storage costs 20,000 gas. If you only need historical records (not on-chain reads), use events.

**Batch operations.** Every transaction has a fixed 21,000 gas base cost. Batching 10 operations into one transaction saves 189,000 gas in base costs alone.

---

## Further reading

- [EIP-1559 specification](https://eips.ethereum.org/EIPS/eip-1559) — the original proposal with full rationale
- [evm.codes](https://www.evm.codes/) — interactive opcode table with exact gas costs
- [L2fees.info](https://l2fees.info/) — live comparison of fees across L2 networks
- [Ethereum gas tracker](https://etherscan.io/gastracker) — current mainnet base fee and mempool state
