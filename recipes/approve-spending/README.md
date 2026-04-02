# Approve Token Spending

Grant (or revoke) a contract's permission to spend your tokens.

## What this does

On EVM, most DeFi operations (swaps, staking, lending) require you to first "approve" the protocol's contract to move your tokens. This recipe handles the approve + check allowance + revoke flow.

On Solana, the equivalent is "delegation" — authorizing another account to transfer your tokens.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Approve** | `approve(spender, amount)` on the ERC-20 contract | `createApproveInstruction` on SPL Token program |
| **Check** | `allowance(owner, spender)` | Read the token account's `delegate` and `delegatedAmount` fields |
| **Revoke** | `approve(spender, 0)` | `createRevokeInstruction` |
| **Unlimited approval** | `approve(spender, type(uint256).max)` — common but risky | Not supported — delegation has a fixed amount |

## Why approvals exist

Blockchain contracts can't pull tokens from your wallet without permission. The approve-then-spend pattern lets you:
1. Approve a DEX to spend 100 USDC
2. The DEX calls `transferFrom` to take exactly the amount needed for your swap

This is a security feature — contracts can only spend what you explicitly approved.

## Security notes

- **Unlimited approvals are risky** — if the contract is compromised, it can drain your entire balance
- **Approve only what you need** — approve the exact amount for each operation
- **Revoke unused approvals** — use tools like revoke.cash to check and revoke old approvals
- **Each approval is a transaction** — it costs gas/fees

## Files

- `evm.tsx` — EVM implementation (approve, check allowance, revoke)
- `solana.tsx` — Solana implementation (delegate, revoke)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
