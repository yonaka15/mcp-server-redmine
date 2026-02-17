import { WikiClient } from "../lib/client/wiki.js";
import { formatWikiHistory, formatWikiPage, formatWikiPagesList } from "../formatters/wiki.js";
import type { ToolResponse } from "./types.js";

const wikiClient = new WikiClient();

export async function handleListWikiPages(params: { project_id: string | number }): Promise<ToolResponse> {
  const { project_id } = params;
  const response = await wikiClient.listWikiPages(project_id);
  const text = formatWikiPagesList(response.wiki_pages);

  return {
    content: [
      { type: "text", text },
      { type: "text", text: JSON.stringify(response, null, 2) },
    ],
    isError: false,
  };
}

export async function handleGetWikiPage(params: {
  project_id: string | number;
  title: string;
  version?: number;
}): Promise<ToolResponse> {
  const { project_id, title, version } = params;
  const response = await wikiClient.getWikiPage(project_id, title, version);
  const text = formatWikiPage(response.wiki_page);

  return {
    content: [
      { type: "text", text },
      { type: "text", text: JSON.stringify(response, null, 2) },
    ],
    isError: false,
  };
}

export async function handleListWikiHistory(params: {
  project_id: string | number;
  title: string;
}): Promise<ToolResponse> {
  const { project_id, title } = params;
  const response = await wikiClient.listWikiHistory(project_id, title);
  const text = formatWikiHistory(response.versions);

  return {
    content: [
      { type: "text", text },
      { type: "text", text: JSON.stringify(response, null, 2) },
    ],
    isError: false,
  };
}

export async function handleListWikiAttachments(params: {
  project_id: string | number;
  title: string;
  version?: number;
}): Promise<ToolResponse> {
  const { project_id, title, version } = params;
  const response = await wikiClient.getWikiPage(project_id, title, version);
  const attachments = response.wiki_page.attachments ?? [];

  const lines: string[] = [];
  if (!attachments.length) {
    lines.push("No attachments found.");
  } else {
    lines.push("Attachments:");
    for (const att of attachments) {
      lines.push(`- ${att.filename} (${att.filesize} bytes)`);
    }
  }

  return {
    content: [
      { type: "text", text: lines.join("\n") },
      { type: "text", text: JSON.stringify({ attachments }, null, 2) },
    ],
    isError: false,
  };
}

export async function handleCreateOrUpdateWikiPage(params: {
  project_id: string | number;
  title: string;
  text: string;
  comments?: string;
  parent_title?: string;
}): Promise<ToolResponse> {
  const { project_id, title, text, comments, parent_title } = params;

  const response = await wikiClient.createOrUpdateWikiPage(project_id, title, text, {
    comments,
    parent_title,
  });

  const formatted = formatWikiPage(response.wiki_page);

  return {
    content: [
      { type: "text", text: formatted },
      { type: "text", text: JSON.stringify(response, null, 2) },
    ],
    isError: false,
  };
}
