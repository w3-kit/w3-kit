# How Transactions Work

A transaction is a signed instruction to change state on the blockchain. Every token transfer, contract call, and NFT mint is a transaction.

---

## The lifecycle of a transaction

### 1. Build
Your dApp constructs the transaction — what to do, who's involved, how much to pay.

### 2. Sign
Your wallet signs the transaction with your private key. This proves you authorized it without revealing the key.

### 3. Broadcast
The signed transaction is sent to the network (via an RPC node).

### 4. Include
A validator picks up your transaction and includes it in a block.

### 5. Confirm
The block is added to the chain. Your transaction is now part of the permanent record.

---

## EVM transactions

An EVM transaction contains:

| Field | Purpose |
|---|---|
| `from` | Your address (derived from signature) |
| `to` | Recipient address (or contract address) |
| `value` | Amount of native ETH to send |
| `data` | Encoded function call (for contract interactions) |
| `gasLimit` | Maximum gas you're willing to use |
| `maxFeePerGas` | Maximum price per unit of gas |
| `maxPriorityFeePerGas` | Tip for the validator |
| `nonce` | Sequential counter preventing replay attacks |
| `chainId` | Which chain this transaction is for |

### Gas explained

Gas is the unit of computational work on EVM chains. Every operation costs gas:
- Sending ETH: 21,000 gas
- ERC-20 transfer: ~65,000 gas
- Uniswap swap: ~150,000 gas

You pay: `gasUsed × gasPrice` in the chain's native token.

**Gas price** fluctuates based on network demand. On Ethereum mainnet, a simple transfer might cost $0.50-$5. On L2s (Arbitrum, Base), the same transfer costs $0.01-$0.10.

---

## Solana transactions

A Solana transaction contains:

| Field | Purpose |
|---|---|
| `instructions` | Array of operations to execute (can be multiple) |
| `recentBlockhash` | Proves the transaction is recent (expires after ~60 seconds) |
| `signatures` | One or more signatures from required signers |

### Instructions

Each instruction specifies:
- **Program ID** — which on-chain program to call
- **Accounts** — which accounts the instruction reads/writes
- **Data** — the instruction payload

### Key difference: Atomicity

A Solana transaction can contain multiple instructions that all execute atomically — all succeed or all fail. On EVM, each transaction is a single operation (though contracts can batch internally).

```
// Solana: one transaction, three instructions
Transaction([
  createTokenAccount(...),
  transferTokens(...),
  closeEmptyAccount(...)
])
// All three happen atomically
```

---

## Fees

| | EVM | Solana |
|---|---|---|
| **Model** | Variable gas price × gas used | Fixed base fee (5,000 lamports per signature) + optional priority fee |
| **Cost** | $0.01 (L2) to $50+ (Ethereum mainnet) | ~$0.0005 per transaction |
| **Predictability** | Unpredictable — depends on network congestion | Very predictable |
| **Who pays** | Sender always pays gas | Sender pays, but programs can subsidize |

---

## Confirmation and finality

**EVM (Ethereum):**
- 1 confirmation = included in a block (~12 seconds)
- 12+ confirmations = considered "final" (~2.5 minutes)
- Blocks can be reorganized (reorged) — wait for enough confirmations for valuable transactions

**Solana:**
- `processed` — seen by the connected validator
- `confirmed` — voted on by supermajority of validators (~400ms)
- `finalized` — rooted, extremely unlikely to be reverted (~6 seconds)

For most dApp interactions, `confirmed` on Solana and 1-3 confirmations on EVM are sufficient.

---

## Failed transactions

**EVM:** If a transaction fails (contract reverts, out of gas), you still pay gas fees. The gas was used to compute that the transaction should fail.

**Solana:** If a transaction fails, you still pay the base fee (5,000 lamports). But since fees are tiny, failed transactions are cheap.

**Common failure reasons:**
- Insufficient balance
- Contract revert (logic error, failed require)
- Expired transaction (Solana: blockhash too old)
- Gas too low (EVM: transaction runs out of gas)
- Nonce mismatch (EVM: transactions must be sequential)
