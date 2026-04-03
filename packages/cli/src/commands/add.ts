import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import chalk from "chalk";
import { writeFileSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { fetchGithubDirectory, fetchDirectoryRecursive } from "../utils/github.js";
import { installDependencies } from "../utils/deps.js";
import { renderLearnContent } from "../utils/learn.js";
import type { ChainFilter, RecipeMeta } from "../types.js";

export function parseRecipeMeta(json: string): RecipeMeta {
  return JSON.parse(json) as RecipeMeta;
}

export function resolveRecipeFiles(
  files: { path: string; content: string }[],
  chain: ChainFilter
): { path: string; content: string }[] {
  return files.filter((f) => {
    const name = basename(f.path);
    if (name === "meta.json") return false;
    if (chain === "evm" && name === "solana.tsx") return false;
    if (chain === "solana" && name === "evm.tsx") return false;
    return true;
  });
}

async function listAvailableRecipes(): Promise<string[]> {
  const entries = await fetchGithubDirectory("recipes");
  return entries.filter((e) => e.type === "dir").map((e) => e.name);
}

export function createAddCommand(): Command {
  const add = new Command("add")
    .description("Add a recipe or contract to your project")
    .argument("[name]", "Recipe or contract name")
    .option("--contract", "Add a contract template instead of a recipe")
    .option("--chain <chain>", "Chain: evm, solana, or both")
    .option("--no-learn", "Skip educational output")
    .action(async (name, options) => {
      if (options.contract) {
        await addContract(name);
      } else {
        await addRecipe(name, options);
      }
    });

  return add;
}

async function addRecipe(
  name: string | undefined,
  options: { chain?: string; learn: boolean }
): Promise<void> {
  if (!name) {
    const spinner = ora("Fetching available recipes...").start();
    let recipes: string[];
    try {
      recipes = await listAvailableRecipes();
      spinner.stop();
    } catch {
      spinner.fail("Failed to fetch recipes from GitHub");
      process.exit(1);
    }

    const response = await prompts({
      type: "autocomplete",
      name: "recipe",
      message: "Pick a recipe:",
      choices: recipes.map((r) => ({ title: r, value: r })),
    });

    if (!response.recipe) { console.log("Cancelled."); return; }
    name = response.recipe as string;
  }

  let chain = options.chain as ChainFilter | undefined;
  if (!chain) {
    const response = await prompts({
      type: "select",
      name: "chain",
      message: "Which chain?",
      choices: [
        { title: "EVM", value: "evm" },
        { title: "Solana", value: "solana" },
        { title: "Both", value: "both" },
      ],
    });
    chain = response.chain;
    if (!chain) { console.log("Cancelled."); return; }
  }

  const spinner = ora(`Downloading ${name}...`).start();
  let allFiles: { path: string; content: string }[];
  try {
    allFiles = await fetchDirectoryRecursive(`recipes/${name}`);
  } catch {
    spinner.fail(`Recipe "${name}" not found`);
    process.exit(1);
  }

  const files = resolveRecipeFiles(allFiles, chain);

  const destDir = join(process.cwd(), "recipes", name);
  mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    const fileName = basename(file.path);
    writeFileSync(join(destDir, fileName), file.content);
  }
  spinner.succeed(`Recipe added to ${chalk.cyan(`./recipes/${name}/`)}`);

  const metaFile = allFiles.find((f) => basename(f.path) === "meta.json");
  if (metaFile) {
    try {
      const meta = parseRecipeMeta(metaFile.content);
      const deps: string[] = [];
      if ((chain === "evm" || chain === "both") && meta.dependencies.evm) deps.push(...meta.dependencies.evm);
      if ((chain === "solana" || chain === "both") && meta.dependencies.solana) deps.push(...meta.dependencies.solana);

      if (deps.length > 0) {
        const depSpinner = ora(`Installing dependencies (${deps.join(", ")})...`).start();
        try {
          installDependencies(process.cwd(), deps);
          depSpinner.succeed("Dependencies installed");
        } catch {
          depSpinner.fail(`Failed to install. Run manually: npm install ${deps.join(" ")}`);
        }
      }
    } catch { /* No valid meta.json — skip deps */ }
  }

  if (options.learn) {
    const learnFile = files.find((f) => f.path.endsWith(".learn.md"));
    if (learnFile) console.log(renderLearnContent(learnFile.content));
  }
}

async function addContract(name: string | undefined): Promise<void> {
  if (!name) {
    const spinner = ora("Fetching available contracts...").start();
    let contracts: string[];
    try {
      const entries = await fetchGithubDirectory("contracts");
      contracts = entries.filter((e) => e.type === "dir").map((e) => e.name);
      spinner.stop();
    } catch {
      spinner.fail("Failed to fetch contracts from GitHub");
      process.exit(1);
    }

    if (contracts.length === 0) { console.log("No contract templates available yet."); return; }

    const response = await prompts({
      type: "autocomplete",
      name: "contract",
      message: "Pick a contract template:",
      choices: contracts.map((c) => ({ title: c, value: c })),
    });

    if (!response.contract) { console.log("Cancelled."); return; }
    name = response.contract as string;
  }

  const spinner = ora(`Downloading ${name}...`).start();
  let files: { path: string; content: string }[];
  try {
    files = await fetchDirectoryRecursive(`contracts/${name}`);
  } catch {
    spinner.fail(`Contract "${name}" not found`);
    process.exit(1);
  }

  const destDir = join(process.cwd(), "contracts", name);
  mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    const relativePath = file.path.replace(`contracts/${name}/`, "");
    const destPath = join(destDir, relativePath);
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, file.content);
  }

  spinner.succeed(`Contract added to ${chalk.cyan(`./contracts/${name}/`)}`);
}
