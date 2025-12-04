import { RedmineVersion } from "../lib/types/index.js";

/**
 * Format versions list
 */
export function formatVersions(versions: RedmineVersion[]): string {
  if (versions.length === 0) {
    return "<versions>No versions found</versions>";
  }

  const lines = versions.map((version) => formatVersionSummary(version));
  return `<versions count="${versions.length}">\n${lines.join("\n")}\n</versions>`;
}

/**
 * Format single version (detailed)
 */
export function formatVersion(version: RedmineVersion): string {
  let result = `<version id="${version.id}">\n`;
  result += `  <name>${escapeXml(version.name)}</name>\n`;
  result += `  <project id="${version.project.id}">${escapeXml(version.project.name)}</project>\n`;
  result += `  <status>${version.status}</status>\n`;
  result += `  <sharing>${version.sharing}</sharing>\n`;

  if (version.description) {
    result += `  <description>${escapeXml(version.description)}</description>\n`;
  }
  if (version.due_date) {
    result += `  <due_date>${version.due_date}</due_date>\n`;
  }
  if (version.wiki_page_title) {
    result += `  <wiki_page_title>${escapeXml(version.wiki_page_title)}</wiki_page_title>\n`;
  }
  if (version.estimated_hours !== undefined) {
    result += `  <estimated_hours>${version.estimated_hours}</estimated_hours>\n`;
  }
  if (version.spent_hours !== undefined) {
    result += `  <spent_hours>${version.spent_hours}</spent_hours>\n`;
  }

  result += `  <created_on>${version.created_on}</created_on>\n`;
  result += `  <updated_on>${version.updated_on}</updated_on>\n`;
  result += `</version>`;

  return result;
}

/**
 * Format version result (create/update)
 */
export function formatVersionResult(version: RedmineVersion, action: string): string {
  return `<result>\n  <status>success</status>\n  <action>${action}</action>\n${formatVersion(version)}\n</result>`;
}

/**
 * Format version deleted
 */
export function formatVersionDeleted(id: number): string {
  return `<result>\n  <status>success</status>\n  <action>deleted</action>\n  <version_id>${id}</version_id>\n</result>`;
}

function formatVersionSummary(version: RedmineVersion): string {
  let result = `  <version id="${version.id}" status="${version.status}">\n`;
  result += `    <name>${escapeXml(version.name)}</name>\n`;
  result += `    <project>${escapeXml(version.project.name)}</project>\n`;
  if (version.due_date) {
    result += `    <due_date>${version.due_date}</due_date>\n`;
  }
  result += `  </version>`;
  return result;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
