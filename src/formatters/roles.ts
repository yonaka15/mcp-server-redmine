import { RedmineRole } from "../lib/types/index.js";

/**
 * Format roles list
 */
export function formatRoles(roles: RedmineRole[]): string {
  if (roles.length === 0) {
    return "<roles>No roles found</roles>";
  }

  const lines = roles.map((role) => {
    return `  <role id="${role.id}">${escapeXml(role.name)}</role>`;
  });

  return `<roles count="${roles.length}">\n${lines.join("\n")}\n</roles>`;
}

/**
 * Format single role (detailed with permissions)
 */
export function formatRole(role: RedmineRole): string {
  let result = `<role id="${role.id}">\n`;
  result += `  <name>${escapeXml(role.name)}</name>\n`;

  if (role.assignable !== undefined) {
    result += `  <assignable>${role.assignable}</assignable>\n`;
  }
  if (role.issues_visibility) {
    result += `  <issues_visibility>${escapeXml(role.issues_visibility)}</issues_visibility>\n`;
  }
  if (role.time_entries_visibility) {
    result += `  <time_entries_visibility>${escapeXml(role.time_entries_visibility)}</time_entries_visibility>\n`;
  }
  if (role.users_visibility) {
    result += `  <users_visibility>${escapeXml(role.users_visibility)}</users_visibility>\n`;
  }

  if (role.permissions && role.permissions.length > 0) {
    const permLines = role.permissions.map((p) => `    <permission>${escapeXml(p)}</permission>`);
    result += `  <permissions>\n${permLines.join("\n")}\n  </permissions>\n`;
  }

  result += `</role>`;
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
