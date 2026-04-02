# Transfer Tokens — Learn

## How token transfers work on-chain

### EVM: Updating a mapping

An ERC-20 transfer is a function call on the token's smart contract:

```solidity
function transfer(address to, uint256 amount) public returns (bool) {
    _balances[msg.sender] -= amount;
    _balances[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
}
```

That's it. The contract decrements the sender's balance and increments the recipient's. The `Transfer` event is emitted for indexers and UIs to track.

Native ETH transfers are simpler — the chain itself moves the balance, no contract call needed.

### Solana: Instruction-based transfers

Solana transfers work differently. Instead of calling a function on a contract, you create an "instruction" that the SPL Token program executes:

```
Instruction:
  Program: SPL Token
  Action: Transfer
  From: sender's token account
  To: recipient's token account
  Authority: sender's wallet (must sign)
  Amount: 1000000
```

The key difference: you're not calling a function on the token — you're telling the Token program to move tokens between accounts.

### The Associated Token Account (ATA) pattern

On EVM, any address can hold any ERC-20 token — the balance is just a number in a mapping inside the token contract.

On Solana, each wallet needs a dedicated "token account" for each token type. The standard is the Associated Token Account (ATA):

```
ATA address = derivedFrom(wallet + mint + TOKEN_PROGRAM)
```

If the recipient has never held this token before, their ATA doesn't exist. The sender must create it (costs ~0.002 SOL in "rent") before transferring.

This is why Solana token transfers are slightly more complex — you may need to create an account before you can send tokens.

## Transaction lifecycle

### EVM
1. Build the transaction (to, value, data)
2. Wallet signs it
3. Transaction broadcast to the network
4. Miners/validators include it in a block
5. Wait for the transaction receipt (confirmation)

### Solana
1. Build the transaction (instructions, recent blockhash)
2. Wallet signs it
3. Transaction sent to a validator
4. Validator includes it in a slot
5. Confirm with desired commitment level (processed → confirmed → finalized)

## Gas and fees

**EVM:** Gas = computational cost. Each operation has a gas cost, and you pay `gasUsed * gasPrice` in the chain's native token. A simple ETH transfer costs ~21,000 gas. An ERC-20 transfer costs ~65,000 gas.

**Solana:** Fixed base fee of 5,000 lamports (~$0.0005) per signature, plus optional priority fees for faster inclusion. Much cheaper and more predictable than EVM gas.
