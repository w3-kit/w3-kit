import type { Chain } from "./types.js";
import chainsData from "../data/chains.json" with { type: "json" };

const chains: Chain[] = chainsData as Chain[];

const chainsByIdMap = new Map<number, Chain>(
  chains.map((chain) => [chain.chainId, chain])
);

export function getAllChains(): Chain[] {
  return chains;
}

export function getChain(chainId: number): Chain | undefined {
  return chainsByIdMap.get(chainId);
}

export function getChainsByEcosystem(
  ecosystem: "evm" | "solana" | "bitcoin"
): Chain[] {
  return chains.filter((chain) => chain.ecosystem === ecosystem);
}
