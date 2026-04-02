# provide-liquidity

Deposit token pairs into on-chain liquidity pools and receive LP tokens representing
your share of the pool.

## What liquidity provision is

When you provide liquidity, you deposit two tokens into a pool in a specific ratio.
In return you receive LP (Liquidity Provider) tokens proportional to your share.
These LP tokens accrue the trading fees paid by swappers. You redeem them later to
withdraw your share of the pool (plus accumulated fees).

## EVM vs Solana

| Aspect              | EVM                                         | Solana                                        |
|---------------------|---------------------------------------------|-----------------------------------------------|
| Approval            | `approve` each token before deposit         | Not required — ATA ownership enforced         |
| Return value        | LP token minted to your address             | LP token ATA credited                         |
| Minimum amounts     | `amountAMin`, `amountBMin` in call          | `minLpTokens` in instruction data             |
| Pool discovery      | Factory contract → `getPair(tokenA, tokenB)`| Program-derived addresses (PDAs)              |
| Removing liquidity  | `removeLiquidity` with LP token amount      | Withdraw instruction with LP token burn       |

## Security notes

- **Impermanent loss**: If token prices diverge significantly, you may end up with less
  value than simply holding both tokens. Understand this risk before providing liquidity.
- **Minimum amounts**: Always set non-zero `amountAMin`/`amountBMin` to prevent your
  deposit from being sandwiched or executed at a manipulated pool ratio.
- **LP token custody**: LP tokens represent your pool share. Never send them to an
  unknown address — loss of LP tokens means loss of the underlying position.
- **Smart contract risk**: Liquidity pools are smart contracts. Verify the pool contract
  is audited and the router is the canonical one for your chosen protocol.
