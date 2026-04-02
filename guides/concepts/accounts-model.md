# Accounts Model — EVM vs Solana, Side-by-Side

The accounts model is the foundation of how a blockchain stores state. Understanding it determines how you structure your dApp, where data lives, how programs execute, and what upgrades cost. EVM and Solana take fundamentally different approaches — and confusing the two is one of the most common mistakes developers make when switching ecosystems.

---

## Why the accounts model matters

On a traditional server, state lives in a database your backend controls. On a blockchain, every piece of state is public, immutable (unless explicitly mutable), and associated with an address. The rules for how those addresses work — what they contain, who can write to them, and how programs access them — define the entire programming model.

---

## EVM: two types of accounts

The EVM has exactly two kinds of accounts. Both share the same 20-byte address space (`0x...`):

### EOA (Externally Owned Account)

- Controlled by a private key
- Has: `balance` (in wei) and `nonce` (transaction count)
- Has no code, no storage
- Can initiate transactions
- Examples: your MetaMask wallet, a deployer script wallet

### Contract account

- Has: `balance`, `nonce`, `bytecode`, and a **storage trie**
- Code runs when a transaction calls it
- Cannot initiate transactions on its own (only respond to calls)
- Storage is a persistent key-value map: 256-bit slot → 256-bit value

### EVM state model

The global state is a single key-value trie (the "world state") where keys are addresses and values are account objects. Each contract has its own nested storage trie — accessed with `SLOAD` and `SSTORE` opcodes.

```
World State Trie
├── 0xAlice → { balance: 1 ETH, nonce: 5 }
├── 0xBob   → { balance: 0.5 ETH, nonce: 2 }
└── 0xToken → { balance: 0, nonce: 0, code: [...], storage: {
                  slot[keccak(Alice)] → 1000,   // Alice's balance in ERC-20
                  slot[keccak(Bob)]   → 500,    // Bob's balance in ERC-20
                } }
```

Every ERC-20 token is a single contract. All user balances live inside that contract's storage trie.

---

## Solana: everything is an account

Solana has one type: **account**. Everything is an account — your wallet, a token balance, a deployed program, the program's data, a PDA. The field layout is always the same:

| Field | Type | Description |
|---|---|---|
| `pubkey` | 32 bytes | The account's address (ed25519 public key or PDA) |
| `lamports` | u64 | SOL balance in lamports (1 SOL = 1,000,000,000 lamports) |
| `data` | `Vec<u8>` | Arbitrary bytes — program-defined structure |
| `owner` | 32 bytes | The program that controls this account |
| `executable` | bool | If true, the account contains a BPF program |
| `rent_epoch` | u64 | Legacy field (rent is now handled via rent-exemption) |

### Key insight: programs are stateless

A Solana program (the equivalent of an EVM contract) does **not** store state inside itself. It only contains the executable bytecode. All state lives in separate accounts that the program **owns**.

```
Program account (executable = true)
└── Owns → User profile account (data = serialized profile struct)
└── Owns → Vault account (data = serialized vault struct, holds lamports)
└── Owns → Config account (data = serialized config struct)
```

This is the opposite of EVM, where the contract and its storage are bundled together.

### Rent exemption

Accounts that store data must maintain a minimum lamport balance proportional to their data size. This is called **rent exemption** — accounts above the minimum are exempt from rent. Creating a new account requires depositing enough lamports to be rent-exempt. Closing an account returns those lamports to the payer.

---

## Side-by-side comparison

| Dimension | EVM | Solana |
|---|---|---|
| Account types | EOA and contract | One type — account |
| State location | Inside contract storage trie | Separate accounts owned by program |
| Address size | 20 bytes (`0x` + 40 hex) | 32 bytes (ed25519 pubkey or off-curve PDA) |
| Key algorithm | secp256k1 | Ed25519 |
| Fee for state | Gas (SSTORE = 20,000 gas) | Rent-exempt deposit in lamports |
| Token balances | Mapping inside ERC-20 contract | Dedicated token account per user per mint |
| Program upgrades | Proxy patterns (UUPS, transparent) | Native via `BPFLoaderUpgradeable` |
| Execution | Sequential within a block | Parallel (Sealevel — non-overlapping account sets) |
| Programs callable by | Transaction or other contracts | Transaction or other programs (CPIs) |

---

## How this affects dApp architecture

### Reading a token balance

**EVM** — one call into the ERC-20 contract's storage:

```ts
import { createPublicClient, http } from "viem";
import { erc20Abi } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({ chain: mainnet, transport: http() });

const balance = await client.readContract({
  address: "0xTokenContractAddress",
  abi: erc20Abi,
  functionName: "balanceOf",
  args: ["0xUserAddress"],
});
// balance is a bigint — the user's token units inside the contract's storage
```

**Solana** — fetch the user's dedicated token account (a separate account owned by the SPL Token program):

```ts
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const mint = new PublicKey("TokenMintAddress...");
const owner = new PublicKey("UserWalletAddress...");

// Derive the user's associated token account address
const tokenAccountAddress = await getAssociatedTokenAddress(mint, owner);

// Fetch the account and deserialize its data
const tokenAccount = await getAccount(connection, tokenAccountAddress);
console.log(tokenAccount.amount); // bigint — token units
```

### Reading raw account data (Solana)

```ts
const accountInfo = await connection.getAccountInfo(tokenAccountAddress);
// accountInfo.data is a Buffer — deserialize with your program's schema
// Anchor programs: use the generated IDL client for automatic deserialization
```

---

## Common misconceptions

**"Solana accounts are like EVM accounts."**
They share the name but almost nothing else. EVM accounts bundle identity, balance, and state. Solana accounts are generic data blobs — wallets, programs, and state all use the same structure, differentiated only by the `owner` field and `executable` flag.

**"Solana programs store state."**
Programs are stateless. They contain only code. State lives in accounts that the program owns. When you "deploy a program," you create two accounts: one for the program itself and one for its upgrade authority metadata.

**"EVM contracts are more powerful because they store their own state."**
Neither is more powerful. The Solana model enables parallel execution (Sealevel) because the runtime knows exactly which accounts a transaction will read/write before executing. EVM's bundled state makes this harder to determine statically.

**"One ERC-20 vs one token account per user."**
On EVM, one ERC-20 contract stores all user balances in a single storage trie. On Solana, each user has a separate token account for each token type. Creating a token account requires a rent-exempt deposit (~0.002 SOL). This is why Solana dApps often need to create Associated Token Accounts (ATAs) before transferring tokens.

---

## Further reading

- [Solana account model docs](https://docs.solana.com/developing/programming-model/accounts) — official reference
- [EVM storage layout](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html) — how Solidity organizes contract storage
- [Anchor account types](https://www.anchor-lang.com/docs/account-types) — Anchor's abstractions over raw Solana accounts
- [evm.codes](https://www.evm.codes/) — SLOAD/SSTORE opcodes and their gas costs
