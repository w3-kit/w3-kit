import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");

async function main() {
  const slot = await connection.getSlot();
  console.log(`Current slot: ${slot}`);

  const address = new PublicKey(
    "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"
  );
  const balance = await connection.getBalance(address);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
}

main().catch(console.error);
