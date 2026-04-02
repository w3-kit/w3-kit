# Learn: Claiming Rewards

## How reward distribution works

### Epoch-based (Solana native, some EVM protocols)

Rewards are calculated and distributed at the end of each epoch. Your effective
yield depends on when in the epoch you staked (partial epochs may earn partial
rewards).

### Continuous / per-block (most EVM DeFi)

Protocols like Synthetix, Curve, and Convex accumulate rewards every block.
`pendingRewards` or `earned` returns the unclaimed balance at any time.

## Auto-compounding

Some protocols (e.g. Beefy, Yearn) auto-compound rewards on your behalf by:
1. Claiming rewards periodically.
2. Swapping reward tokens back to the staked asset.
3. Re-staking — increasing your principal.

This converts APR into effective APY. Cost: a small protocol fee (typically
1–5% of yield).

## Manual compounding

If the protocol doesn't auto-compound, you can manually:
1. Claim rewards.
2. Swap reward token → staking token (see `swap-tokens` recipe).
3. Stake again (see `stake-tokens` recipe).

Gas cost per compounding cycle reduces net yield; compound less frequently on
high-fee networks (Ethereum mainnet).

## Tax considerations

In many jurisdictions:
- Staking rewards are taxed as **income** at the time of receipt (fair market
  value when earned).
- Selling the reward token is a **capital gains** event.
- Keep records of reward amounts and timestamps.

Not financial or tax advice — consult a professional for your jurisdiction.

## Key takeaway

Claiming rewards is straightforward on EVM. On Solana native staking, there is
no explicit "claim" — rewards are realised during the withdraw flow. For
auto-compounding, LST protocols or yield aggregators are the simplest option.
