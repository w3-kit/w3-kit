import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

async function main() {
  const blockNumber = await client.getBlockNumber();
  console.log(`Latest block: ${blockNumber}`);

  const balance = await client.getBalance({
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  });
  console.log(`vitalik.eth balance: ${formatEther(balance)} ETH`);
}

main().catch(console.error);
