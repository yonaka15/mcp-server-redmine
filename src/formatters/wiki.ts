import { RedmineWikiPage, RedmineWikiPageHistoryItem, RedmineWikiPageListItem } from "../lib/types/wiki/index.js";

export function formatWikiPagesList(pages: RedmineWikiPageListItem[]): string {
  if (!pages.length) {
    return "No wiki pages found.";
  }

  const lines: string[] = ["Wiki Pages:"];
  for (const page of pages) {
    const versionInfo = page.version !== undefined ? ` (v${page.version})` : "";
    lines.push(`- ${page.title}${versionInfo}`);
  }
  return lines.join("\n");
}

export function formatWikiPage(page: RedmineWikiPage): string {
  const lines: string[] = [];
  lines.push(`# ${page.title}`);

  if (page.version !== undefined) {
    lines.push(`Version: ${page.version}`);
  }
  if (page.author) {
    lines.push(`Author: ${page.author.name} (ID: ${page.author.id})`);
  }
  if (page.updated_on) {
    lines.push(`Updated: ${page.updated_on}`);
  }
  if (page.comments) {
    lines.push("");
    lines.push(`Comments: ${page.comments}`);
  }
  if (page.text) {
    lines.push("");
    lines.push(page.text);
  }

  if (page.attachments && page.attachments.length > 0) {
    lines.push("");
    lines.push("Attachments:");
    for (const att of page.attachments) {
      lines.push(`- ${att.filename} (${att.filesize} bytes)`);
    }
  }

  return lines.join("\n");
}

export function formatWikiHistory(history: RedmineWikiPageHistoryItem[]): string {
  if (!history.length) {
    return "No wiki history found.";
  }

  const lines: string[] = ["Wiki Page History:"];
  for (const item of history) {
    const author = item.author ? `${item.author.name} (ID: ${item.author.id})` : "Unknown";
    const updated = item.updated_on ?? "Unknown date";
    const comments = item.comments ? ` - ${item.comments}` : "";
    lines.push(`- v${item.version} by ${author} at ${updated}${comments}`);
  }
  return lines.join("\n");
}
