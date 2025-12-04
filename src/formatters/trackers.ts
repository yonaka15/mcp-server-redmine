import { RedmineTracker } from "../lib/types/index.js";

/**
 * Format trackers list
 */
export function formatTrackers(trackers: RedmineTracker[]): string {
  if (trackers.length === 0) {
    return "<trackers>No trackers found</trackers>";
  }

  const lines = trackers.map((tracker) => {
    let line = `  <tracker id="${tracker.id}">\n`;
    line += `    <name>${escapeXml(tracker.name)}</name>\n`;
    if (tracker.default_status) {
      line += `    <default_status id="${tracker.default_status.id}">${escapeXml(tracker.default_status.name)}</default_status>\n`;
    }
    if (tracker.description) {
      line += `    <description>${escapeXml(tracker.description)}</description>\n`;
    }
    if (tracker.enabled_standard_fields && tracker.enabled_standard_fields.length > 0) {
      line += `    <enabled_standard_fields>${tracker.enabled_standard_fields.join(", ")}</enabled_standard_fields>\n`;
    }
    line += `  </tracker>`;
    return line;
  });

  return `<trackers count="${trackers.length}">\n${lines.join("\n")}\n</trackers>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
