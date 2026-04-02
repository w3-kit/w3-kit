# Approve Spending — Learn

## The approve/transferFrom pattern

This is one of the most important patterns in EVM DeFi. Here's why it exists:

### The problem
You want to swap 100 USDC for ETH on Uniswap. But Uniswap's contract can't just take your tokens — that would be a massive security hole. So how does the contract get your tokens?

### The solution: Two-step process
1. **You approve:** Call `USDC.approve(uniswapRouter, 100e6)` — "Uniswap can spend up to 100 USDC from my wallet"
2. **The contract pulls:** When you execute the swap, Uniswap calls `USDC.transferFrom(you, pool, 100e6)`

### Why not just send tokens directly?
If you sent tokens first, the contract wouldn't know they came from you or what you wanted in return. The approve pattern lets the contract atomically: verify permission → pull your tokens → give you the output — all in one transaction.

## The unlimited approval problem

Many dApps ask for "unlimited" approvals (`type(uint256).max` ≈ 10^77 tokens) so you don't have to re-approve each time. The UX is better, but the security is worse:

- If the contract has a bug, an attacker can drain your entire token balance
- If the contract is upgradeable, the owner could change the logic to steal funds
- Old approvals persist forever unless explicitly revoked

**Best practice:** Approve only the amount you need. The extra gas for re-approving is worth the security.

## Solana's delegation model

Solana doesn't have `approve`/`transferFrom`. Instead, it has "delegation":

```
approve(tokenAccount, delegate, owner, amount)
```

Key differences from EVM:
- **No unlimited delegation** — you must specify an exact amount
- **One delegate at a time** — setting a new delegate replaces the previous one
- **Revoke is explicit** — `revokeInstruction` removes the delegation entirely
- **Amount decreases** — as the delegate transfers tokens, the delegated amount decreases

This is arguably safer by design: no unlimited approvals, and delegation state is visible on the token account.

## How to check and revoke approvals

### EVM
```typescript
// Check
const allowance = await token.allowance(owner, spender);

// Revoke (approve 0)
await token.approve(spender, 0);
```

Tools like revoke.cash scan all your token approvals across chains and let you revoke them in bulk.

### Solana
```typescript
// Check — read the token account
const account = await getAccount(connection, ata);
console.log(account.delegate, account.delegatedAmount);

// Revoke
const tx = new Transaction().add(createRevokeInstruction(ata, owner));
```
