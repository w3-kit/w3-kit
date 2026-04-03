import chalk from "chalk";

export function formatTable(headers: string[], rows: string[][]): string {
  const allRows = [headers, ...rows];
  const colWidths = headers.map((_, i) =>
    Math.max(...allRows.map((row) => (row[i] || "").length))
  );

  const topBorder = "┌" + colWidths.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const midBorder = "├" + colWidths.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const botBorder = "└" + colWidths.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const formatRow = (row: string[]) =>
    "│" + row.map((cell, i) => ` ${(cell || "").padEnd(colWidths[i])} `).join("│") + "│";

  const lines = [
    topBorder,
    "│" + headers.map((h, i) => ` ${chalk.bold(h.padEnd(colWidths[i]))} `).join("│") + "│",
    midBorder,
    ...rows.map(formatRow),
    botBorder,
  ];

  return lines.join("\n");
}

export function formatKeyValue(pairs: [string, string][]): string {
  const maxKeyLen = Math.max(...pairs.map(([k]) => k.length));
  return pairs
    .map(([key, value]) => `${chalk.bold(key.padEnd(maxKeyLen))}  ${value}`)
    .join("\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
