import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import chalk from "chalk";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename, dirname } from "path";
import { fetchDirectoryRecursive } from "../utils/github.js";
import { runInstall } from "../utils/deps.js";
import type { TemplateMeta } from "../types.js";

const TEMPLATES: TemplateMeta[] = [
  { name: "nextjs-evm", description: "Next.js dApp with wagmi + viem + RainbowKit", chain: "evm", stack: "Next.js + wagmi + viem + RainbowKit" },
  { name: "script-evm", description: "TypeScript script with viem", chain: "evm", stack: "TypeScript + viem" },
  { name: "nextjs-solana", description: "Next.js dApp with wallet-adapter", chain: "solana", stack: "Next.js + wallet-adapter" },
  { name: "script-solana", description: "TypeScript script with @solana/web3.js", chain: "solana", stack: "TypeScript + @solana/web3.js" },
];

export function filterTemplates(
  templates: TemplateMeta[],
  chain: "evm" | "solana" | "both"
): TemplateMeta[] {
  if (chain === "both") return templates;
  return templates.filter((t) => t.chain === chain);
}

export function createInitCommand(): Command {
  const init = new Command("init")
    .description("Scaffold a new web3 project")
    .argument("[name]", "Project name")
    .option("--template <name>", "Template name")
    .option("--chain <chain>", "Chain: evm, solana, or both")
    .option("--pm <pm>", "Package manager: npm, pnpm, yarn, or bun")
    .action(async (name, options) => {
      await runInit(name, options);
    });
  return init;
}

async function runInit(
  name: string | undefined,
  options: { template?: string; chain?: string; pm?: string }
): Promise<void> {
  if (!name) {
    const response = await prompts({ type: "text", name: "name", message: "Project name:", initial: "my-dapp" });
    name = response.name;
    if (!name) { console.log("Cancelled."); return; }
  }

  const projectDir = join(process.cwd(), name);
  if (existsSync(projectDir)) {
    console.error(chalk.red(`Directory "${name}" already exists.`));
    process.exit(1);
  }

  let chain = options.chain as "evm" | "solana" | "both" | undefined;
  if (!chain) {
    const response = await prompts({
      type: "select", name: "chain", message: "Which chain?",
      choices: [
        { title: "EVM (Ethereum, Arbitrum, Base, Polygon...)", value: "evm" },
        { title: "Solana", value: "solana" },
        { title: "Both", value: "both" },
      ],
    });
    chain = response.chain;
    if (!chain) { console.log("Cancelled."); return; }
  }

  let templateName = options.template;
  if (!templateName) {
    const available = filterTemplates(TEMPLATES, chain);
    const response = await prompts({
      type: "select", name: "template", message: "Pick a template:",
      choices: available.map((t) => ({ title: `${t.name} — ${t.description}`, value: t.name })),
    });
    templateName = response.template;
    if (!templateName) { console.log("Cancelled."); return; }
  }

  const spinner = ora("Fetching template...").start();
  let files: { path: string; content: string }[];
  try {
    files = await fetchDirectoryRecursive(`templates/${templateName}`);
  } catch {
    spinner.fail(`Template "${templateName}" not found on GitHub`);
    process.exit(1);
  }

  mkdirSync(projectDir, { recursive: true });
  const prefix = `templates/${templateName}/`;

  for (const file of files) {
    const relativePath = file.path.startsWith(prefix) ? file.path.slice(prefix.length) : basename(file.path);
    let content = file.content;
    if (relativePath === "package.json") {
      try { const pkg = JSON.parse(content); pkg.name = name; content = JSON.stringify(pkg, null, 2) + "\n"; } catch {}
    }
    const destPath = join(projectDir, relativePath);
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, content);
  }
  spinner.succeed("Template downloaded");

  const installSpinner = ora("Installing dependencies...").start();
  try {
    runInstall(projectDir);
    installSpinner.succeed("Dependencies installed");
  } catch {
    installSpinner.warn("Could not install dependencies. Run manually.");
  }

  console.log(`\n${chalk.green("Project ready!")}\n\n  cd ${name}\n  npm run dev\n`);
}
