import type { RedmineApiResponse, RedmineProject } from "../lib/types/index.js";

/**
 * Convert project status to string
 */
function formatStatus(status: number): string {
  switch (status) {
    case 1:
      return "active";
    case 5:
      return "archived";
    case 9:
      return "closed";
    default:
      return "unknown";
  }
}

/**
 * Format a single project
 */
export function formatProject(project: RedmineProject): string {
  return `<project>
  <id>${project.id}</id>
  <name>${project.name}</name>
  <identifier>${project.identifier}</identifier>
  <status>${formatStatus(project.status)}</status>
  <is_public>${project.is_public ? "yes" : "no"}</is_public>
  ${project.parent ? `<parent>${project.parent.name}</parent>` : ''}
  <created_on>${project.created_on}</created_on>
  ${project.homepage ? `<homepage>${project.homepage}</homepage>` : ''}
  ${project.description ? `<description>${project.description}</description>` : ''}
  ${project.enabled_modules?.length ? `
  <enabled_modules>
    ${project.enabled_modules.map(module => `<module>${module}</module>`).join('\n    ')}
  </enabled_modules>` : ''}
  ${project.trackers?.length ? `
  <trackers>
    ${project.trackers.map(tracker => `<tracker>${tracker.name}</tracker>`).join('\n    ')}
  </trackers>` : ''}
  ${project.issue_categories?.length ? `
  <categories>
    ${project.issue_categories.map(category => `<category>${category.name}</category>`).join('\n    ')}
  </categories>` : ''}
  ${project.time_entry_activities?.length ? `
  <time_entry_activities>
    ${project.time_entry_activities.map(activity => 
      `<activity${activity.is_default ? ' default="true"' : ''}${!activity.active ? ' active="false"' : ''}>${activity.name}</activity>`
    ).join('\n    ')}
  </time_entry_activities>` : ''}
  ${project.custom_fields?.length ? `
  <custom_fields>
    ${project.custom_fields.map(field => `
    <field>
      <name>${field.name}</name>
      <value>${Array.isArray(field.value) ? field.value.join(", ") : field.value}</value>
    </field>`).join('')}
  </custom_fields>` : ''}
</project>`;
}

/**
 * Format list of projects
 */
export function formatProjects(response: RedmineApiResponse<RedmineProject>): string {
  if (!Array.isArray(response.projects) || response.projects.length === 0) {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<projects />";
  }

  const projects = response.projects.map(formatProject).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<projects total_count="${response.total_count}" offset="${response.offset}" limit="${response.limit}">
${projects}
</projects>`;
}

/**
 * Format project create/update result
 */
export function formatProjectResult(project: RedmineProject, action: "created" | "updated"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <message>Project "${project.name}" was successfully ${action}.</message>
  ${formatProject(project)}
</response>`;
}

/**
 * Format project deletion result
 */
export function formatProjectDeleted(id: string | number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <message>Project "${id}" was successfully deleted.</message>
</response>`;
}

/**
 * Format project archive status change result
 */
export function formatProjectArchiveStatus(id: string | number, archived: boolean): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <message>Project "${id}" was successfully ${archived ? "archived" : "unarchived"}.</message>
</response>`;
}