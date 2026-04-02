# How Liquidity Provision Works

## Liquidity Pools

A liquidity pool is a smart contract holding reserves of two (or more) tokens.
Traders swap against these reserves; liquidity providers (LPs) deposit the tokens
and earn a share of trading fees.

**Pool share** = your deposit / total pool liquidity × 100%

## LP Tokens

When you deposit, the pool mints LP tokens proportional to your share.
LP tokens are redeemable: burn them to withdraw your share of the current reserves
plus accumulated fees.

Example: pool has 100 ETH + 200,000 USDC. You deposit 10 ETH + 20,000 USDC (10%
of the pool). You receive 10% of LP token supply. Later, fees have grown the pool to
110 ETH + 220,000 USDC. Your 10% is now worth 11 ETH + 22,000 USDC.

## Impermanent Loss (IL)

IL is the opportunity cost of providing liquidity vs simply holding both tokens.

It occurs when the price ratio between the two tokens changes. The AMM formula
rebalances the pool automatically — which means you end up holding more of the
cheaper token and less of the more expensive one.

**IL is "impermanent"** because it disappears if prices return to the entry ratio.
It becomes permanent when you withdraw while prices are still diverged.

| Price change (one token) | Approximate IL |
|--------------------------|----------------|
| 1.25x                    | 0.6%           |
| 1.5x                     | 2.0%           |
| 2x                       | 5.7%           |
| 4x                       | 20%            |
| 10x                      | 42.5%          |

## Concentrated Liquidity

V3-style AMMs let LPs choose a price range. Liquidity is only active (and earning fees)
when the market price is within that range. This improves capital efficiency but
requires active management — if price leaves the range, you earn no fees.

## Fee Tiers

Pools come in different fee tiers (e.g., 0.01%, 0.05%, 0.3%, 1%).
- Stable pairs (USDC/USDT): use low fee tiers (0.01–0.05%)
- Blue-chip volatile pairs (ETH/USDC): 0.3% is most liquid
- Exotic pairs: 1% compensates LPs for higher IL risk

## Key Terms

- **TVL**: Total Value Locked — total dollar value of assets in a pool
- **APR/APY**: Annualized fee return for LPs (varies by volume and pool size)
- **Rebalancing**: The AMM automatically adjusting reserves to maintain k = x*y
- **PDA**: Program Derived Address (Solana) — deterministic address for pool state
- **Tick**: Discrete price point used in concentrated liquidity (V3-style) AMMs
