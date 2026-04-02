# Top 10 Smart Contract Vulnerabilities — EVM & Solana

Smart contract bugs are permanent. There is no patch Tuesday, no hotfix deployment, no rollback. Funds lost to a vulnerability are usually lost forever. This guide covers the 10 most common vulnerabilities across EVM and Solana, with examples of what the vulnerable code looks like and exactly how to fix it.

---

## 1. Reentrancy (EVM)

**What it is:** An external call transfers control to the callee before the caller has updated its state. The callee re-enters the caller and exploits the stale state to drain funds. The DAO hack (2016, $60M) and countless others since use this pattern.

**Vulnerable:**

```solidity
// BAD: state is updated AFTER the external call
mapping(address => uint256) public balances;

function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    // ← attacker's fallback/receive re-enters here
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);

    balances[msg.sender] = 0; // too late — already re-entered
}
```

**Safe — checks-effects-interactions pattern:**

```solidity
function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    balances[msg.sender] = 0;            // effect first
    (bool success, ) = msg.sender.call{value: amount}(""); // interaction last
    require(success);
}
```

Or use OpenZeppelin's `ReentrancyGuard`:

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // safe — mutex prevents re-entry
    }
}
```

---

## 2. Integer Overflow / Underflow (EVM)

**What it is:** Before Solidity 0.8, arithmetic wrapped silently. `uint8(255) + 1 == 0`. Attackers could overflow a balance check to bypass transfer limits or underflow a counter to wrap to `type(uint256).max`.

**Vulnerable (Solidity <0.8):**

```solidity
uint256 public totalSupply = 100;

function burn(uint256 amount) external {
    totalSupply -= amount; // if amount > totalSupply → wraps to enormous number
}
```

**Safe:**
- Solidity ≥0.8 reverts on overflow/underflow by default — use it
- For pre-0.8 contracts: use OpenZeppelin `SafeMath`
- For post-0.8 code using `unchecked {}` blocks: manually verify the math cannot overflow before opting out of checks

---

## 3. Missing Access Control (EVM & Solana)

**What it is:** Sensitive functions — minting tokens, upgrading contracts, draining funds — are callable by anyone because the developer forgot to add an authorization check.

**Vulnerable (EVM):**

```solidity
// Anyone can call this
function setOwner(address newOwner) external {
    owner = newOwner;
}
```

**Safe (EVM):**

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    function setOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }
}
```

**Vulnerable (Solana/Anchor):**

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Missing: no check that the caller is the vault authority
    transfer_lamports(&ctx.accounts.vault, &ctx.accounts.recipient, amount)?;
    Ok(())
}
```

**Safe (Solana/Anchor):**

```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = authority)]  // enforces vault.authority == authority.key()
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,  // enforces that authority signed the transaction

    #[account(mut)]
    pub recipient: SystemAccount<'info>,
}
```

---

## 4. Frontrunning (EVM)

**What it is:** Ethereum transactions sit in a public mempool before inclusion. MEV bots monitor pending transactions and insert their own transactions with higher gas fees to execute first.

**Common attacks:**
- **Sandwich attack:** Bot sees a large DEX swap → inserts a buy before it (price up) → swap executes at worse price → bot sells immediately after
- **Transaction sniping:** Bot sees an NFT purchase at floor price and frontruns it

**Prevention:**
- Set slippage tolerance on swaps: `amountOutMin` in Uniswap, `minAmountOut` in your own code
- Use commit-reveal schemes for auctions (submit a hash, reveal the value later)
- Use private mempools: [Flashbots Protect](https://protect.flashbots.net/) routes transactions directly to validators, bypassing the public mempool

---

## 5. Oracle Manipulation (EVM & Solana)

**What it is:** On-chain price oracles that use spot prices from a DEX can be manipulated within a single transaction. If your protocol reads a spot price to determine how much collateral to accept, an attacker can inflate or deflate that price instantaneously using a flash loan.

**Example attack:** Borrow $10M in DAI via flash loan → buy Token X on Uniswap, spiking its price → deposit Token X as collateral at the manipulated price → borrow $10M in stablecoins → swap back, crash the price → repay flash loan → profit from the undercollateralized loan.

**Prevention:**
- Use time-weighted average prices (TWAP) — Uniswap v3 TWAP, Chainlink price feeds, Pyth Network
- Require prices to be older than a minimum age (e.g., reject Pyth prices older than 60 seconds)
- Add circuit breakers: reject transactions if the price has moved more than X% from a reference

---

## 6. Flash Loan Attacks (EVM)

**What it is:** Flash loans allow anyone to borrow unlimited capital within a single transaction, as long as the full amount is repaid by the end of that transaction. They cost nothing to initiate and require no collateral. Combined with other vulnerabilities (especially oracle manipulation), they are the most common vector for large DeFi exploits.

**Prevention:**
- Never use spot prices from AMMs as oracles (see #5)
- Use `nonReentrant` guards on all lending/borrowing functions
- Check invariants at the end of every transaction: total collateral must remain above total debt
- Consider per-block interaction limits for large operations

---

## 7. Signature Replay (EVM)

**What it is:** A valid signed message is reused outside its intended context. If a user signs an off-chain approval message to claim a discount on contract A, and the same message is valid on contract B or on a different chain, an attacker can replay it.

**Vulnerable:**

```solidity
function claim(bytes calldata signature) external {
    bytes32 hash = keccak256(abi.encodePacked(msg.sender));
    address signer = ECDSA.recover(hash, signature);
    require(signer == trustedSigner, "Invalid signature");
    // No check: was this signature already used? Is it for this contract? This chain?
}
```

**Safe:**

```solidity
// Include chain ID, contract address, nonce, and expiry in the signed payload
// Use EIP-712 for structured, human-readable signing

bytes32 public constant DOMAIN_SEPARATOR = keccak256(abi.encode(
    keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)"),
    keccak256("MyProtocol"),
    block.chainid,
    address(this)
));

mapping(address => uint256) public nonces;

function claim(uint256 nonce, uint256 expiry, bytes calldata signature) external {
    require(block.timestamp < expiry, "Expired");
    require(nonces[msg.sender]++ == nonce, "Invalid nonce");

    bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, msg.sender, nonce, expiry));
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

    address signer = ECDSA.recover(digest, signature);
    require(signer == trustedSigner, "Invalid signature");
}
```

---

## 8. Uninitialized Accounts (Solana)

**What it is:** A program reads from an account without verifying it was properly initialized by the program. An attacker crafts a fake account with arbitrary data that passes a superficial key check but contains manipulated fields.

**Vulnerable:**

```rust
pub fn update(ctx: Context<Update>) -> Result<()> {
    // No check: was this account created by our program?
    // Was it initialized with the right discriminator?
    let config = &ctx.accounts.config;
    // Attacker passes a crafted account that looks like Config but isn't
    do_something_with(config.admin);
    Ok(())
}
```

**Safe (Anchor handles this automatically):**

```rust
#[derive(Accounts)]
pub struct Update<'info> {
    // Account<'info, Config> checks:
    // 1. owner == program_id
    // 2. First 8 bytes == sha256("account:Config")[..8] (discriminator)
    pub config: Account<'info, Config>,
}
```

If you are writing native (non-Anchor) Solana programs, manually check:
```rust
require!(config_account.owner == program_id, ErrorCode::InvalidOwner);
require!(config_data[..8] == CONFIG_DISCRIMINATOR, ErrorCode::InvalidDiscriminator);
```

---

## 9. Missing Signer Checks (Solana)

**What it is:** An instruction accepts a public key as the "authority" and checks that the key matches an expected value — but never verifies that the account actually signed the transaction. Any transaction can pass any public key as an `AccountInfo`, regardless of whether the corresponding private key holder authorized it.

**Vulnerable:**

```rust
pub fn admin_action(ctx: Context<AdminAction>) -> Result<()> {
    // Checks the key, NOT whether it signed the transaction
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin,
        ErrorCode::Unauthorized
    );
    // Attacker passes config.admin as an AccountInfo without that wallet signing
    Ok(())
}
```

**Safe (Anchor):**

```rust
#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(has_one = admin)]
    pub config: Account<'info, Config>,

    // Signer<'info> enforces that this account signed the transaction
    pub admin: Signer<'info>,
}
```

The difference between `AccountInfo` (unchecked) and `Signer<'info>` (enforces signature) is one of the most common Solana audit findings.

---

## 10. PDA Seed Collisions (Solana)

**What it is:** Two accounts with different semantic meanings are derived to the same PDA because the seeds are not unique enough. An attacker can pass one account where the other is expected, bypassing logic that assumes it received the correct account type.

**Vulnerable:**

```rust
// Vault: seeds = [b"token", mint.key()]
// Metadata: seeds = [b"token", mint.key()]
// → same PDA! Program cannot distinguish them
```

**Safe — unique discriminator prefix per type:**

```rust
// Vault:    seeds = [b"vault",    mint.key()]
// Metadata: seeds = [b"metadata", mint.key()]
// → different addresses, no collision
```

Additional patterns to avoid collisions:
- For per-user, per-type records: `[b"order", user.key(), &order_id.to_le_bytes()]`
- Never derive two conceptually different accounts from identical seeds, even if your current code only uses one of them — future code or other programs could exploit the ambiguity

---

## Closing: tools and resources

**Static analysis:**
- [Slither](https://github.com/crytic/slither) — EVM static analyzer from Trail of Bits; catches reentrancy, access control, and arithmetic issues automatically
- [Anchor's `anchor verify`](https://www.anchor-lang.com/docs/verifiable-builds) — verifiable builds for Solana programs
- [Soteria](https://www.soteria.dev/) — Solana smart contract security scanner

**Manual review checklists:**
- [Trail of Bits EVM security checklist](https://github.com/crytic/building-secure-contracts)
- [Neodyme Solana security workshop](https://workshop.neodyme.io/) — hands-on Solana vulnerability exercises
- [Anchor security best practices](https://www.anchor-lang.com/docs/security)

**Bug bounties and post-mortems:**
- [Immunefi](https://immunefi.com/) — bug bounty platform; payouts up to $10M for critical DeFi vulnerabilities
- [Rekt News](https://rekt.news/) — database of DeFi hacks with post-mortems
