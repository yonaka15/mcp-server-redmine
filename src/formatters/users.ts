import type { RedmineUser, RedmineUserList } from "../lib/types/users/index.js";

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if(typeof unsafe !== 'string') {
    console.debug('Invalid input to escapeXml:', unsafe, new Error().stack);
    return '';
  }

  return unsafe
    .replace(/[&]/g, '&amp;')
    .replace(/[<]/g, '&lt;')
    .replace(/[>]/g, '&gt;')
    .replace(/["]/g, '&quot;')
    .replace(/[']/g, '&apos;');
}

/**
 * Format user status
 * See app/models/principal.rb for available statuses
 */
function formatStatus(status: number): string {
  switch (status) {
    case 1:
      return 'active';     // User can login and use their account
    case 2:
      return 'registered'; // User has registered but not yet confirmed/activated
    case 3:
      return 'locked';     // User was once active and is now locked
    default:
      return 'unknown';
  }
}

/**
 * Format roles for membership
 */
function formatRoles(roles?: { id: number; name: string; }[]): string {
  if (!roles?.length) return '';
  
  return `
      <roles type="array">
        ${roles.map(role => `
        <role>
          <id>${role.id}</id>
          <name>${escapeXml(role.name)}</name>
        </role>`).join('')}
      </roles>`;
}

/**
 * Format a single user
 * Fields returned depend on user privileges:
 * - For non-admin viewing non-admin: firstname, lastname, mail, created_on
 * - For non-admin viewing admin: firstname, lastname, created_on, last_login_on
 * - For admin: all fields
 * - For self: login, api_key added
 */
export function formatUser(user: RedmineUser): string {
  const fields = new Map<string, string>();

  // Required fields (always visible)
  fields.set('id', String(user.id));
  fields.set('firstname', user.firstname);
  fields.set('lastname', user.lastname);
  fields.set('created_on', user.created_on);

  // Additional fields based on access level
  if (user.login) fields.set('login', user.login);
  if (user.mail) fields.set('mail', user.mail);
  if (user.api_key) fields.set('api_key', user.api_key);
  if (user.status !== undefined) fields.set('status', formatStatus(user.status));
  if (user.last_login_on) fields.set('last_login_on', user.last_login_on);
  if (user.admin) fields.set('admin', 'true');
  if (user.updated_on) fields.set('updated_on', user.updated_on);
  if (user.passwd_changed_on) fields.set('passwd_changed_on', user.passwd_changed_on);
  fields.set('avatar_url', user.avatar_url || '');

  // Build XML for basic fields
  let xml = '<user>\n';
  for (const [key, value] of fields) {
    xml += `  <${key}>${escapeXml(value)}</${key}>\n`;
  }

  // Add custom fields if present
  if (user.custom_fields?.length) {
    xml += '  <custom_fields type="array">\n';
    for (const field of user.custom_fields) {
      xml += '    <field>\n';
      xml += `      <id>${field.id}</id>\n`;
      xml += `      <name>${escapeXml(field.name)}</name>\n`;
      xml += `      <value>${Array.isArray(field.value) ? escapeXml(field.value.join(", ")) : escapeXml(field.value)}</value>\n`;
      xml += '    </field>\n';
    }
    xml += '  </custom_fields>\n';
  }

  // Add memberships if present
  if (user.memberships?.length) {
    xml += '  <memberships type="array">\n';
    for (const membership of user.memberships) {
      xml += '    <membership>\n';
      if (membership.id) {
        xml += `      <id>${membership.id}</id>\n`;
      }
      xml += '      <project>\n';
      xml += `        <id>${membership.project.id}</id>\n`;
      xml += `        <name>${escapeXml(membership.project.name)}</name>\n`;
      xml += '      </project>\n';
      xml += formatRoles(membership.roles);
      xml += '    </membership>\n';
    }
    xml += '  </memberships>\n';
  }

  // Add groups if present
  if (user.groups?.length) {
    xml += '  <groups type="array">\n';
    for (const group of user.groups) {
      xml += '    <group>\n';
      xml += `      <id>${group.id}</id>\n`;
      xml += `      <name>${escapeXml(group.name)}</name>\n`;
      xml += '    </group>\n';
    }
    xml += '  </groups>\n';
  }

  xml += '</user>';
  return xml;
}

/**
 * Format list of users
 */
export function formatUsers(response: RedmineUserList): string {
  if (response.users.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<users type="array" total_count="0" limit="0" offset="0" />';
  }
  
  const users = response.users.map(formatUser).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<users type="array" total_count="${response.total_count}" limit="${response.limit || response.users.length}" offset="${response.offset || 0}">
${users}
</users>`;
}

/**
 * Format user create/update result
 */
export function formatUserResult(user: RedmineUser, action: "created" | "updated"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <message>User #${user.id} was successfully ${action}.</message>
  ${formatUser(user)}
</response>`;
}

/**
 * Format user deletion result
 */
export function formatUserDeleted(id: number): string {
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <message>User #${id} was successfully deleted.</message>
</response>`;
  return response;
}
