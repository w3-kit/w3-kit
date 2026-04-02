# swap-tokens

Execute token swaps on EVM chains and Solana using generic AMM router interfaces.

## What swaps do

A swap exchanges one token for another via an on-chain liquidity pool.
Instead of matching buyers and sellers, AMMs use a pricing formula (e.g., x*y=k)
to price trades automatically.

## EVM vs Solana

| Aspect         | EVM                                      | Solana                                    |
|----------------|------------------------------------------|-------------------------------------------|
| Approval step  | Required (`approve` before swap)         | Not required — ATA ownership is sufficient|
| Router pattern | Single contract call with path array     | Program instruction with custom layout    |
| Slippage param | `amountOutMin` in the call               | `minAmountOut` in instruction data        |
| Token accounts | One address per token                    | Associated Token Accounts (ATAs) per pair |
| Gas / fees     | Gas in ETH/native token                  | Fixed lamport fee (~0.000005 SOL)         |

## Security notes

- **Slippage**: Always set `amountOutMin` / `minAmountOut`. A value of 0 means you
  accept any output — MEV bots will extract maximum value from your transaction.
- **Deadline**: Use a short deadline (≤20 min) on EVM to prevent pending-tx exploitation.
- **MEV / Frontrunning**: Large swaps are visible in the mempool and can be sandwiched.
  Use private RPC endpoints (Flashbots, etc.) for large trades on EVM.
- **Price impact**: Swapping a large share of a pool's liquidity moves the price significantly.
  Check price impact before executing.
- **Approval amount**: Prefer approving exact `amountIn` rather than `type(uint256).max`
  to limit exposure if the router contract is ever exploited.
