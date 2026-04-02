# claim-rewards

Claim accumulated staking rewards from a staking contract (EVM) or withdraw
from a native stake account (Solana).

## How rewards work

### EVM

Most staking contracts track rewards with an `earned` or `pendingRewards` view
function. Calling `claim()` (or `harvest()`, `getReward()` — name varies)
transfers the accrued tokens to your wallet.

Common patterns:
- `claim()` — claim without touching principal.
- `exit()` — unstake principal + claim rewards in one call.
- `compound()` — auto-restake rewards (if the contract supports it).

### Solana

Native SOL staking rewards are embedded in the stake account's lamport balance.
To access them:

1. **Deactivate** the stake account (begins cooldown ~1 epoch / ~2 days).
2. **Withdraw** all lamports once deactivation is complete.

For liquid staking protocols (Marinade, Jito, Lido), rewards are reflected in
the exchange rate of the LST token — no explicit claim required.

## Comparison table

| Aspect | EVM | Solana native |
|---|---|---|
| Claim action | `claim()` tx | deactivate + withdraw |
| Timing | Immediate (depends on protocol) | ~1 epoch cooldown |
| Reward token | Protocol-defined ERC-20 | SOL (embedded in balance) |
| Auto-compound | Some protocols support it | Not native; use LST protocols |

## Security notes

- Verify the contract's `claim` function doesn't have reentrancy vulnerabilities.
- On EVM, batch claiming multiple pools in one tx can save gas.
- On Solana, never close a stake account you intend to reuse — create a new one.
