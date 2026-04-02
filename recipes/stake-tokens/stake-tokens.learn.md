# Learn: Staking

## Proof-of-Stake basics

PoS networks (Ethereum, Solana) select validators proportional to their stake.
Validators earn block rewards and fees; delegators share in those rewards.

## Native vs liquid vs DeFi staking

| Type | Example | Tradeoff |
|---|---|---|
| Native | SOL delegation, ETH solo validator | Full rewards, illiquid |
| Liquid | stSOL (Marinade), stETH (Lido) | Tradeable LST, small fee |
| DeFi | Synthetix SNX, Curve CRV | Token emissions, smart contract risk |

## APY vs APR

- **APR** (Annual Percentage Rate): simple interest, no compounding.
- **APY** (Annual Percentage Yield): includes compounding effect.
- Most DeFi UIs show APY. Native staking usually shows APR.
- Formula: `APY = (1 + APR/n)^n − 1` where n = compounding periods/year.

## Epoch-based vs continuous rewards

- **Solana**: rewards distributed once per epoch (~2 days). Stake must be active
  (not in warmup) to earn for that epoch.
- **EVM protocols**: vary — some accrue per block, others require manual `claim`.

## Slashing risks

- EVM: protocol-specific; some have no slashing, others slash for inactivity or
  double-signing.
- Solana native: validators can be slashed for double-voting; rare in practice.
- Liquid staking: slashing risk is socialised across all LST holders.

## Unbonding / cooldown

Always read the protocol docs for cooldown periods before staking. Some EVM
protocols have multi-day withdrawal queues. Solana native stake takes ~1 epoch
to deactivate before funds can be withdrawn.

## Key takeaway

Staking is not risk-free. Understand lock-up, slashing exposure, and whether
you're earning in a volatile token before committing capital.
