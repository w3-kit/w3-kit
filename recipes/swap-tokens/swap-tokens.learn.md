# How Token Swaps Work

## Automated Market Makers (AMMs)

Traditional exchanges match buyers with sellers. AMMs replace the order book with
a **liquidity pool** — a smart contract holding reserves of two tokens.

### The constant product formula: x * y = k

- `x` = reserve of token A
- `y` = reserve of token B
- `k` = constant (never changes during a swap)

When you swap token A for token B, you add `Δx` to the pool.
The new `y` is `k / (x + Δx)`, so you receive `y - k/(x+Δx)` of token B.

**Effect**: the more you buy, the worse your price gets (diminishing returns).

## Slippage

The difference between the price you expect and the price you get.
Causes: price moves between when you sign and when the tx executes.
Always set a maximum acceptable slippage (e.g., 0.5% = `amountOutMin = expectedOut * 0.995`).

## Price Impact

How much your swap moves the market price. A $100 swap in a $1M pool has 0.01% impact.
The same swap in a $10k pool has ~1% impact. Check before transacting.

## DEX Aggregators

Aggregators (1inch, Jupiter, etc.) split your swap across multiple pools to find
the best price and minimize price impact. They do NOT hold your funds.

## MEV and Frontrunning

**MEV (Maximal Extractable Value)**: validators/searchers profit by reordering transactions.

**Sandwich attack**:
1. Attacker sees your swap in the mempool
2. Attacker buys token B first (drives price up)
3. Your swap executes at the worse price
4. Attacker sells token B for profit

**Mitigations**:
- Use private RPC / MEV-protected endpoints
- Set tight slippage tolerance
- Use commit-reveal schemes or batched swaps

## Key Terms

- **Path**: the token route — e.g., [USDC → WETH → DAI] for a multi-hop swap
- **Deadline**: Unix timestamp after which the tx reverts (prevents stale execution)
- **LP fee**: small percentage (e.g., 0.3%) kept in the pool, distributed to liquidity providers
- **ATA**: Associated Token Account (Solana) — deterministic address for a (wallet, mint) pair
