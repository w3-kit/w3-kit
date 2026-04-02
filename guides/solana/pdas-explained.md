# PDAs Explained — Program Derived Addresses From First Principles

A Program Derived Address (PDA) is one of Solana's most important primitives. It enables programs to own and sign for accounts without holding a private key. Once you understand PDAs, patterns like token vaults, user profiles, and escrow accounts become straightforward to reason about.

---

## The problem PDAs solve

Solana programs are stateless — they store no data internally. All state lives in accounts. But here is the problem: to create or modify an account, someone must sign the transaction. Wallets sign with a private key. Programs have no private key.

Without PDAs, you could not build:
- A token vault owned by a program (who would sign to move tokens out?)
- A per-user profile account derived deterministically (how would you find it without storing a mapping?)
- An escrow that releases funds automatically on-chain (who controls the escrow address?)

PDAs solve this by creating addresses that **no one has a private key for**, but that a **specific program can sign for** using its own identity.

---

## What a PDA is

Solana uses the Ed25519 curve for public keys. Every valid Ed25519 public key corresponds to a point on this curve, and for every such point a private key exists.

A PDA is a point that is **intentionally placed off the Ed25519 curve**. Because it is off-curve, no private key can exist for it — it is mathematically impossible to sign with it using a standard keypair. But the Solana runtime has a special instruction mechanism (`invoke_signed`) that lets a program "sign" for a PDA by re-deriving it from seeds. No private key is ever involved.

---

## Derivation

```
PDA = findProgramAddress(seeds, programId)
```

**Seeds** are an array of byte slices — arbitrary data you choose to make the address unique and meaningful. Common seeds:
- String literals: `b"profile"`, `b"vault"`
- Public keys: `user.key().as_ref()`, `mint.key().as_ref()`
- Numbers: `&order_id.to_le_bytes()`

**`findProgramAddressSync`** in JavaScript (and the equivalent in Rust) tries bump values from 255 down to 0, hashing `[...seeds, bump, programId]` each time, until it finds a hash that falls off the Ed25519 curve. It returns the address and the bump:

```ts
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("YourProgramId...");
const userPublicKey = new PublicKey("UserWallet...");

const [profilePda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("profile"), userPublicKey.toBuffer()],
  programId
);

console.log("PDA:", profilePda.toBase58());
console.log("Bump:", bump); // typically 255, sometimes lower
```

---

## Bump seeds

The bump is the value (0–255) that was needed to push the derived address off the Ed25519 curve. The **canonical bump** is the highest value (closest to 255) that works. It is deterministic — given the same seeds and program ID, `findProgramAddressSync` will always return the same PDA and the same canonical bump.

**Always store the bump in the PDA account.** Re-searching for the bump on every instruction is expensive. Anchor makes this easy:

```rust
#[account]
pub struct Profile {
    pub bump: u8,
    pub owner: Pubkey,
    pub username: String,
}
```

Then in your instruction handler you can verify the PDA without searching:

```rust
let seeds = &[b"profile", ctx.accounts.user.key.as_ref(), &[ctx.accounts.profile.bump]];
let signer_seeds = &[&seeds[..]];
```

---

## Why programs can sign for PDAs

The Solana runtime provides `invoke_signed` (in native programs) and Anchor handles this transparently. When a program calls `invoke_signed`, it passes the seeds and bump. The runtime:

1. Re-derives the PDA from those seeds + program ID
2. Confirms it matches the account in the instruction
3. Marks that account as "signed" for the duration of the call

No private key. No off-chain secret. The program's own identity (its program ID) is the authority.

In Anchor, the `seeds` and `bump` constraints in your account struct handle this automatically.

---

## Creating a PDA account in Anchor

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramId...");

#[program]
pub mod my_program {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, username: String) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.bump = ctx.bumps.profile;
        profile.owner = ctx.accounts.user.key();
        profile.username = username;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Profile::INIT_SPACE,
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Profile {
    pub bump: u8,
    pub owner: Pubkey,
    #[max_len(32)]
    pub username: String,
}
```

Anchor's `init` constraint creates the account, transfers the rent-exempt deposit from `user`, and sets the `owner` to your program. The `seeds` and `bump` constraints ensure the address is a valid PDA derived from those seeds.

---

## Common PDA patterns

| Pattern | Seeds | Use case |
|---|---|---|
| User profile | `[b"profile", user_pubkey]` | Per-user state, one account per wallet |
| Token vault | `[b"vault", mint_pubkey]` | Escrow tokens on behalf of users |
| Global config | `[b"config"]` | Singleton state for the whole program |
| Order book entry | `[b"order", user_pubkey, &order_id.to_le_bytes()]` | Per-user indexed records |
| Whitelist entry | `[b"whitelist", user_pubkey]` | Membership proof — account existence = membership |

---

## Calling a PDA-signing instruction from TypeScript

```ts
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";

const provider = AnchorProvider.env();
const program = new Program(idl, provider);

const [profilePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("profile"), provider.wallet.publicKey.toBuffer()],
  program.programId
);

const tx = await program.methods
  .createProfile("alice")
  .accounts({
    profile: profilePda,
    user: provider.wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("Created profile at:", profilePda.toBase58());
```

---

## Security: seed collisions

If two different semantic meanings can produce the same PDA, an attacker can trick the program into treating one account as the other.

**Vulnerable — same seeds for two different account types:**

```rust
// vault account: seeds = [b"token", mint.key()]
// metadata account: seeds = [b"token", mint.key()]
// → same PDA! Attacker can pass one where the other is expected
```

**Safe — unique discriminator prefix per account type:**

```rust
// vault:    seeds = [b"vault",    mint.key()]
// metadata: seeds = [b"metadata", mint.key()]
// → different PDAs, no collision possible
```

Additional rules:
- Include a unique index for per-user records if users can create multiple: `[b"order", user.key(), &order_id.to_le_bytes()]`
- Never use user-controlled data as the only seed — a user could craft seeds that collide with a privileged account
- Anchor's `Account<'info, T>` type automatically validates the discriminator (first 8 bytes of account data) on deserialization, which is an additional guard against passing the wrong account type

---

## Further reading

- [Anchor PDA constraints](https://www.anchor-lang.com/docs/pdas) — `seeds`, `bump`, `has_one`, and `constraint` reference
- [Solana Cookbook: PDAs](https://solanacookbook.com/core-concepts/pdas.html) — native (non-Anchor) PDA patterns
- [Solana docs: signing with PDAs](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses) — `invoke_signed` internals
