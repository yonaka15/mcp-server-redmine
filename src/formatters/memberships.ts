import { RedmineMembership } from "../lib/types/index.js";

/**
 * Format memberships list
 */
export function formatMemberships(memberships: RedmineMembership[], totalCount: number): string {
  if (memberships.length === 0) {
    return "<memberships>No memberships found</memberships>";
  }

  const lines = memberships.map((membership) => formatMembershipSummary(membership));
  return `<memberships count="${memberships.length}" total="${totalCount}">\n${lines.join("\n")}\n</memberships>`;
}

/**
 * Format single membership (detailed)
 */
export function formatMembership(membership: RedmineMembership): string {
  let result = `<membership id="${membership.id}">\n`;
  result += `  <project id="${membership.project.id}">${escapeXml(membership.project.name)}</project>\n`;

  if (membership.user) {
    result += `  <user id="${membership.user.id}">${escapeXml(membership.user.name)}</user>\n`;
  }
  if (membership.group) {
    result += `  <group id="${membership.group.id}">${escapeXml(membership.group.name)}</group>\n`;
  }

  const roleLines = membership.roles.map((role) => {
    const inherited = role.inherited ? ` inherited="true"` : "";
    return `    <role id="${role.id}"${inherited}>${escapeXml(role.name)}</role>`;
  });
  result += `  <roles>\n${roleLines.join("\n")}\n  </roles>\n`;
  result += `</membership>`;

  return result;
}

/**
 * Format membership result (create)
 */
export function formatMembershipResult(membership: RedmineMembership, action: string): string {
  return `<result>\n  <status>success</status>\n  <action>${action}</action>\n${formatMembership(membership)}\n</result>`;
}

/**
 * Format membership deleted
 */
export function formatMembershipDeleted(id: number): string {
  return `<result>\n  <status>success</status>\n  <action>deleted</action>\n  <membership_id>${id}</membership_id>\n</result>`;
}

/**
 * Format membership updated
 */
export function formatMembershipUpdated(id: number): string {
  return `<result>\n  <status>success</status>\n  <action>updated</action>\n  <membership_id>${id}</membership_id>\n</result>`;
}

function formatMembershipSummary(membership: RedmineMembership): string {
  let result = `  <membership id="${membership.id}">\n`;
  result += `    <project>${escapeXml(membership.project.name)}</project>\n`;

  if (membership.user) {
    result += `    <user>${escapeXml(membership.user.name)}</user>\n`;
  }
  if (membership.group) {
    result += `    <group>${escapeXml(membership.group.name)}</group>\n`;
  }

  const roleNames = membership.roles.map((r) => r.name).join(", ");
  result += `    <roles>${escapeXml(roleNames)}</roles>\n`;
  result += `  </membership>`;
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
