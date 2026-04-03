import { existsSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function detectPackageManager(projectDir: string): PackageManager {
  if (existsSync(join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(projectDir, "yarn.lock"))) return "yarn";
  if (existsSync(join(projectDir, "bun.lockb"))) return "bun";
  return "npm";
}

export function buildInstallCommand(
  pm: PackageManager,
  packages: string[]
): { command: string; args: string[] } | null {
  if (packages.length === 0) return null;
  switch (pm) {
    case "npm": return { command: "npm", args: ["install", ...packages] };
    case "pnpm": return { command: "pnpm", args: ["add", ...packages] };
    case "yarn": return { command: "yarn", args: ["add", ...packages] };
    case "bun": return { command: "bun", args: ["add", ...packages] };
  }
}

export function installDependencies(projectDir: string, packages: string[]): void {
  const pm = detectPackageManager(projectDir);
  const cmd = buildInstallCommand(pm, packages);
  if (!cmd) return;
  execFileSync(cmd.command, cmd.args, { cwd: projectDir, stdio: "pipe" });
}

export function runInstall(projectDir: string): void {
  const pm = detectPackageManager(projectDir);
  const args = pm === "yarn" ? [] : ["install"];
  execFileSync(pm, args, { cwd: projectDir, stdio: "pipe" });
}
