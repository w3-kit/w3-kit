#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRegistryCommand } from "./commands/registry.js";
import { createAddCommand } from "./commands/add.js";
import { createInitCommand } from "./commands/init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const program = new Command();
program.name("w3-kit").description("CLI toolkit for web3 development").version(pkg.version);
program.addCommand(createRegistryCommand());
program.addCommand(createAddCommand());
program.addCommand(createInitCommand());
program.parse();
