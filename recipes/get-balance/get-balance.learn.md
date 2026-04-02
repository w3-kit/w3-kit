# Get Balance — Learn

## How balances work on-chain

### EVM: State in the contract

On EVM chains, token balances are stored inside each token's smart contract as a mapping:

```solidity
// Inside the USDC contract
mapping(address => uint256) private _balances;
```

To read your USDC balance, you call `balanceOf(yourAddress)` on the USDC contract. This is a "view" function — it reads state without modifying it, so it costs no gas.

Native ETH balance is different — it's tracked by the chain itself, not a contract. Every address has a native balance managed by the protocol.

### Solana: Accounts hold everything

On Solana, everything is an account. Your SOL balance is stored in your main account. But token balances are stored in separate "token accounts":

```
Your wallet (main account)
├── SOL balance: stored here
├── USDC token account: a separate account holding your USDC
├── BONK token account: another separate account
└── ... one account per token you hold
```

Each token account is owned by the SPL Token program and associated with both your wallet and the token's "mint" (the token's identifier).

### Associated Token Accounts (ATAs)

The "Associated Token Account" is a deterministic address derived from your wallet + the token mint. It's the standard way to find someone's token account:

```
ATA = deriveAddress(wallet, tokenMint, TOKEN_PROGRAM_ID)
```

If the ATA doesn't exist, it means the wallet has never held that token. You can create it (costs ~0.002 SOL rent) when sending tokens to someone for the first time.

## The decimals problem

Blockchains don't have floating-point numbers. Balances are stored as integers.

```
On-chain: 1000000 (integer)
Display:  1.000000 USDC (formatted with 6 decimals)
```

Every token defines its own decimal precision:
- ETH: 18 decimals → 1 ETH = 10^18 wei
- SOL: 9 decimals → 1 SOL = 10^9 lamports
- USDC: 6 decimals on both EVM and Solana
- WBTC: 8 decimals

Getting decimals wrong is a common source of bugs. Sending `1000000` of a token with 18 decimals sends 0.000000000001 tokens, not 1 million.

## Read operations: Free but not instant

Reading balances doesn't cost gas because you're querying an RPC node's cached state, not executing a transaction. But:

- **RPC rate limits:** Free endpoints (Alchemy, QuickNode) have request limits
- **Stale data:** The RPC node's state may lag by a few seconds
- **Different nodes, different answers:** During chain reorgs, different RPC nodes may report different balances briefly
