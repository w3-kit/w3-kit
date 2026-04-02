# Create Token — Learn

## Two very different approaches

Creating a token reveals one of the biggest architectural differences between EVM and Solana.

### EVM: Deploy code

On EVM, a token IS a smart contract. To create a token, you write Solidity code that implements the ERC-20 interface:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

You compile this to bytecode, then deploy it via a transaction. The deployed contract gets its own address and stores all token state (balances, allowances, total supply).

Because you write the code, you can add any logic: transfer taxes, max wallet limits, auto-liquidity, vesting schedules, etc.

### Solana: Create an account

On Solana, ALL tokens use the same program (SPL Token). Creating a token means:

1. Generate a new keypair (this becomes the mint address)
2. Create an account at that address with enough SOL for rent
3. Initialize it as a "mint" via the SPL Token program

```typescript
const mint = await createMint(
  connection,
  payer,         // Who pays for the account
  mintAuthority, // Who can mint new tokens
  freezeAuthority, // Who can freeze accounts (or null)
  decimals,      // Token precision
);
```

That's it. No code to write, no compilation, no deployment. The SPL Token program already knows how to handle transfers, approvals, burns, etc.

## Authorities (Solana)

Solana tokens have two key authorities:

**Mint Authority** — can create new tokens via `mintTo`. If you renounce this (set to null), the supply is permanently fixed.

**Freeze Authority** — can freeze any token account, preventing transfers. Stablecoins (USDC) use this for compliance. For most tokens, you should set this to null.

## Contract verification (EVM)

After deploying an ERC-20 on EVM, users can't see the source code — only the bytecode. "Verifying" the contract on Etherscan means uploading the source code and proving it compiles to the deployed bytecode. This lets anyone audit the token's logic.

Unverified token contracts are a red flag — if you can't read the code, you don't know what it does.

## Common patterns

**Fixed supply:** Mint all tokens in the constructor (EVM) or via `mintTo` then renounce mint authority (Solana).

**Mintable:** Keep mint authority to create tokens on demand (rewards, staking yields).

**Burnable:** Allow holders to destroy their own tokens, reducing total supply. Standard in OpenZeppelin, supported natively in SPL Token.
