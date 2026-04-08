import { Command } from "commander";
import { getAllChains, getChain, getAllTokens, getToken } from "@w3-kit/registry";
import type { Chain, Token } from "@w3-kit/registry";
import { formatTable, formatKeyValue, formatJson } from "../utils/display.js";

export function formatChainsTable(chains: Chain[]) {
  const headers = ["Chain", "Chain ID", "Type", "Native Token"];
  const rows = chains.map((c) => [
    c.name,
    String(c.chainId),
    c.testnet ? "testnet" : c.ecosystem,
    c.nativeCurrency.symbol,
  ]);
  return { headers, rows };
}

export function formatChainDetail(chain: Chain): [string, string][] {
  return [
    ["Chain", chain.name],
    ["Chain ID", String(chain.chainId)],
    ["Ecosystem", chain.ecosystem],
    [
      "Native Token",
      `${chain.nativeCurrency.name} (${chain.nativeCurrency.symbol}, ${chain.nativeCurrency.decimals} decimals)`,
    ],
    ["RPC", chain.rpcUrls[0] || "—"],
    ["Explorer", chain.blockExplorers[0] || "—"],
    ["Testnet", chain.testnet ? "Yes" : "No"],
  ];
}

export function formatTokenTable(token: Token) {
  const chains = getAllChains();
  const chainMap = new Map(chains.map((c) => [c.chainId, c.name]));
  const headers = ["Chain", "Address", "Decimals"];
  const rows = token.chains.map((c) => [
    chainMap.get(c.chainId) || String(c.chainId),
    c.address,
    String(token.decimals),
  ]);
  return { headers, rows };
}

export function createRegistryCommand(): Command {
  const registry = new Command("registry").description("Query chain and token data");

  registry
    .command("chains")
    .description("List all supported chains")
    .option("--json", "Output as JSON")
    .action((options) => {
      const chains = getAllChains();
      if (options.json) {
        console.log(formatJson(chains));
      } else {
        const { headers, rows } = formatChainsTable(chains);
        console.log(formatTable(headers, rows));
      }
    });

  registry
    .command("chain <id>")
    .description("Show details for a specific chain")
    .option("--json", "Output as JSON")
    .action((id, options) => {
      const chain = getChain(Number(id));
      if (!chain) {
        console.error(`Chain with ID ${id} not found.`);
        process.exit(1);
      }
      if (options.json) {
        console.log(formatJson(chain));
      } else {
        console.log(formatKeyValue(formatChainDetail(chain)));
      }
    });

  registry
    .command("tokens")
    .description("List all supported tokens")
    .option("--json", "Output as JSON")
    .action((options) => {
      const tokens = getAllTokens();
      if (options.json) {
        console.log(formatJson(tokens));
      } else {
        const headers = ["Token", "Symbol", "Chains"];
        const rows = tokens.map((t) => [t.name, t.symbol, String(t.chains.length)]);
        console.log(formatTable(headers, rows));
      }
    });

  registry
    .command("token <symbol>")
    .description("Show token addresses across chains")
    .option("--json", "Output as JSON")
    .action((symbol, options) => {
      const token = getToken(symbol);
      if (!token) {
        console.error(`Token "${symbol}" not found.`);
        process.exit(1);
      }
      if (options.json) {
        console.log(formatJson(token));
      } else {
        const { headers, rows } = formatTokenTable(token);
        console.log(`\n${token.name} (${token.symbol})\n`);
        console.log(formatTable(headers, rows));
      }
    });

  return registry;
}
