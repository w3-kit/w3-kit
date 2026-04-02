# What Are Smart Contracts?

Smart contracts are programs that run on a blockchain. They execute automatically when called, with results that anyone can verify. No middlemen, no trust required — the code is the rule.

---

## The basic idea

A smart contract is code that:
1. Lives on the blockchain (immutable once deployed)
2. Has its own address (you call it like sending a transaction)
3. Executes deterministically (same inputs always produce same outputs)
4. Can hold and transfer assets (tokens, NFTs, ETH/SOL)

Think of it as a vending machine: you put in money, press a button, and the machine gives you what the code says. No human decides whether to give you the soda — the machine (contract) follows its programming.

---

## EVM: Smart contracts (Solidity)

On EVM chains, smart contracts are written in **Solidity**, compiled to bytecode, and deployed to the chain.

```solidity
// A simple token contract
contract MyToken {
    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

### Key characteristics
- **Stateful:** Contracts store data (balances, settings, ownership) directly on-chain
- **Immutable:** Once deployed, the code can't be changed (unless you use a proxy pattern)
- **Composable:** Contracts can call other contracts, enabling DeFi "money legos"
- **Gas-metered:** Every operation costs gas, preventing infinite loops

### The contract lifecycle
1. Write Solidity code
2. Compile to EVM bytecode
3. Deploy via a transaction (costs gas)
4. Contract gets its own address
5. Anyone can call its public functions by sending transactions to that address

---

## Solana: Programs

Solana calls them "programs" instead of "smart contracts," and the architecture is fundamentally different.

```rust
// A Solana program (using Anchor framework)
#[program]
pub mod my_token {
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        require!(from.balance >= amount, ErrorCode::InsufficientBalance);
        from.balance -= amount;
        to.balance += amount;
        Ok(())
    }
}
```

### Key characteristics
- **Stateless:** Programs don't store data — data lives in separate "accounts"
- **Account model:** Everything is an account: programs, data, tokens, metadata
- **Explicit accounts:** Every instruction declares which accounts it reads/writes
- **Parallel execution:** Because accounts are explicit, Solana can run non-overlapping transactions in parallel

### The program lifecycle
1. Write Rust code (usually with Anchor framework)
2. Compile to BPF bytecode
3. Deploy via a transaction
4. Program gets its own address
5. Users send transactions with instructions that call the program

---

## EVM vs Solana: The architecture difference

The biggest difference is **where data lives**:

```
EVM:
┌─────────────────────┐
│ Token Contract       │
│ ┌─────────────────┐  │
│ │ Code (transfer)  │  │
│ │ Data (balances)  │  │  ← Code and data live together
│ └─────────────────┘  │
└─────────────────────┘

Solana:
┌──────────────┐     ┌──────────────┐
│ Token Program │     │ Data Account │
│ ┌──────────┐  │     │ balance: 100 │  ← Code and data are separate
│ │ Code     │  │     └──────────────┘
│ │ (logic)  │  │     ┌──────────────┐
│ └──────────┘  │     │ Data Account │
└──────────────┘     │ balance: 50  │
                     └──────────────┘
```

**EVM:** Each token has its own contract containing both the logic AND the data. The USDC contract holds all USDC balances.

**Solana:** The SPL Token program holds the logic. Each user's balance is a separate "data account" that the program operates on. One program, many data accounts.

---

## How dApps interact with contracts

### EVM
```typescript
// Call a contract function
const result = await contract.balanceOf(address);    // Read (free)
const tx = await contract.transfer(to, amount);       // Write (costs gas)
```

### Solana
```typescript
// Send an instruction to a program
const instruction = createTransferInstruction(from, to, owner, amount);
const tx = new Transaction().add(instruction);
await sendTransaction(tx, connection);
```

---

## Key concepts

### Immutability
Once deployed, a smart contract's code cannot be changed. This is a feature — users can trust that the rules won't change. But it means bugs are permanent.

**Upgradeable contracts** (EVM: proxy pattern, Solana: upgradeable BPF loader) allow updates, but this introduces trust in the upgrade authority.

### Composability
Contracts can call other contracts. This enables:
- A DEX contract calling a token contract to move funds
- A lending contract calling an oracle contract for price data
- A yield aggregator calling multiple DeFi contracts

This composability is why DeFi is called "money legos."

### Auditing
Because contract code is on-chain and (usually) open-source, anyone can audit it. This transparency is a core property of web3 — you don't have to trust the team, you can verify the code.

**But:** Most users can't read Solidity/Rust. Professional audits (Trail of Bits, OpenZeppelin, Neodyme) are the industry standard for high-value contracts.
