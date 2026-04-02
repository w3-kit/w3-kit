# stake-tokens

Stake tokens to earn yield by locking assets in a staking contract (EVM) or
delegating SOL to a validator (Solana).

## What is staking?

You lock up tokens with a protocol or network. In return you receive:
- **Native staking rewards** (from the network's inflation/block rewards).
- **DeFi staking rewards** (from protocol fees or token emissions).

## EVM pattern

1. `approve` the staking contract to spend your token.
2. Call `stake(amount)` on the staking contract.
3. Read `stakedBalance(address)` to confirm.

Typical contracts: Synthetix SNX staking, Convex, Lido wstETH wrapper.

## Solana pattern

1. Create a `StakeAccount` (on-chain account that holds your SOL).
2. Call `delegate` to assign it to a validator's vote account.
3. Wait ~1 epoch (~2 days) for the stake to become active.

For liquid staking (e.g. Marinade, Jito), use their SDKs instead — you receive
an LST token immediately without waiting for epoch activation.

## EVM vs Solana comparison

| Aspect | EVM | Solana |
|---|---|---|
| Asset | Any ERC-20 | Native SOL |
| Lock period | Protocol-defined | ~1 epoch (~2 days) |
| Reward token | Protocol token or same token | Inflation SOL |
| Slashing | Protocol-dependent | Validator misbehaviour |

## Security notes

- Verify the staking contract is audited before calling `approve`.
- Use `safeApprove` or grant only the needed allowance.
- On Solana, keep the stake keypair safe — losing it means losing access to
  your stake account (though your wallet remains the withdrawer authority).
