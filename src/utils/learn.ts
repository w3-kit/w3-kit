import { Marked } from "marked";
import TerminalRenderer from "marked-terminal";
import chalk from "chalk";

const marked = new Marked(TerminalRenderer);

export function renderLearnContent(markdown: string): string {
  const rendered = marked.parse(markdown);
  if (typeof rendered !== "string") return markdown;

  const divider = chalk.dim("─".repeat(48));
  return `\n${divider}\n${rendered}\n${divider}\n`;
}
