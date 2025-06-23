# Redmine MCP Server

[![smithery badge](https://smithery.ai/badge/@yonaka15/mcp-server-redmine)](https://smithery.ai/server/@yonaka15/mcp-server-redmine)

This is a Model Context Protocol (MCP) server implementation for Redmine. It integrates with Redmine's REST API to provide ticket and project information to LLMs.

<a href="https://glama.ai/mcp/servers/55eg9u36cg"><img width="380" height="200" src="https://glama.ai/mcp/servers/55eg9u36cg/badge" alt="Redmine Server MCP server" /></a>

## Features

Supports stable resources from Redmine REST API:

- Issues (1.0~)
- Projects (1.0~)
- Users (1.1~)
- Time Entries (1.1~)

### Tools

#### Issues

- Search Issues
  - Filter by project, status, assignee, etc.
  - Keyword search
  - Custom field support
- Create/Update Issues
  - Set tracker, status, priority
  - Configure custom fields
  - Add comments
- Delete Issues

#### Projects

- Search Projects
  - Filter by active/archived/closed status
  - Keyword search
- Get Project Details
  - Include trackers, categories information
- Create/Update Projects
  - Configure modules and trackers
  - Set member inheritance
- Archive/Unarchive Projects
- Delete Projects

#### Time Entries

- Search Time Entries
  - Filter by project, user, date range
- Get Time Entry Details
- Create/Update Time Entries
  - Record against project or issue
  - Specify activity
  - Custom field support
- Delete Time Entries

## Usage with Claude

To use this server with Claude, configure it as follows:

```json
{
  "mcp-server-redmine": {
    "command": "npx",
    "args": [
      "-y",
      "--prefix",
      "/path/to/mcp-server-redmine",
      "mcp-server-redmine"
    ],
    "env": {
      "REDMINE_HOST": "https://your-redmine.example.com",
      "REDMINE_API_KEY": "your-api-key-here"
    }
  }
}
```

### Configuration Options

- `command`: Command to execute the npm package
- `args`:
  - `-y`: Auto-respond "yes" to prompts
  - `--prefix`: Specify installation directory
  - Last argument specifies the package name
- `env`: Environment variables
  - `REDMINE_HOST`: Redmine server URL
  - `REDMINE_API_KEY`: Your Redmine API key

## Setup

### Getting an API Key

1. Enable REST API in Redmine admin settings
2. Get API key from user settings page

### Environment Variables

Set the following environment variables:

- `REDMINE_API_KEY`: API key obtained from Redmine user settings
- `REDMINE_HOST`: Redmine server URL (e.g., `https://redmine.example.com`)

## Testing

### Unit Tests

```bash
# Run tests
npm test
```

For data safety, only GET operations are included in tests.

### Inspector Testing

Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to verify functionality.

Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to verify functionality.

#### GUI Mode

```bash
# Build
npm run build

# Set execute permission (important)
chmod +x dist/index.js

# Launch inspector
npx @modelcontextprotocol/inspector dist/index.js
```

#### CLI Mode
#### CLI Testing Commands

Here are practical examples for testing the Redmine MCP Server using CLI mode.

**Prerequisites:**

```bash
# Build the project
npm run build

# Set execute permission
chmod +x dist/index.js

# Set environment variables
export REDMINE_API_KEY=your-api-key-here
export REDMINE_HOST=http://localhost:3000  # or your Redmine server URL
```

**Basic Testing Commands:**

1. **List available tools:**

   ```bash
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/list
   ```

2. **Test Issues functionality:**

   ```bash
   # List issues (with limit)
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name list_issues \
     --tool-arg limit=5

   # Get specific issue details
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name get_issue \
     --tool-arg id=1

   # Filter issues by project
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name list_issues \
     --tool-arg project_id=1 \
     --tool-arg limit=3
   ```

3. **Test Projects functionality:**

   ```bash
   # List all projects
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name list_projects

   # Get specific project details
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name show_project \
     --tool-arg id=1
   ```

4. **Test Users functionality (requires admin privileges):**

   ```bash
   # List users
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name list_users

   # Get specific user details
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name show_user \
     --tool-arg id=1
   ```

5. **Test Time Entries functionality:**

   ```bash
   # List time entries
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name list_time_entries \
     --tool-arg limit=5

   # Get specific time entry details
   npx @modelcontextprotocol/inspector --cli \
     -e REDMINE_API_KEY=$REDMINE_API_KEY \
     -e REDMINE_HOST=$REDMINE_HOST \
     node dist/index.js \
     --method tools/call \
     --tool-name show_time_entry \
     --tool-arg id=1
   ```

**Advanced Testing:**

```bash
# Filter issues by status
npx @modelcontextprotocol/inspector --cli \
  -e REDMINE_API_KEY=$REDMINE_API_KEY \
  -e REDMINE_HOST=$REDMINE_HOST \
  node dist/index.js \
  --method tools/call \
  --tool-name list_issues \
  --tool-arg status_id=1 \
  --tool-arg limit=5

# Search issues by keyword
npx @modelcontextprotocol/inspector --cli \
  -e REDMINE_API_KEY=$REDMINE_API_KEY \
  -e REDMINE_HOST=$REDMINE_HOST \
  node dist/index.js \
  --method tools/call \
  --tool-name list_issues \
  --tool-arg subject="bug" \
  --tool-arg limit=3

# Get time entries for specific project
npx @modelcontextprotocol/inspector --cli \
  -e REDMINE_API_KEY=$REDMINE_API_KEY \
  -e REDMINE_HOST=$REDMINE_HOST \
  node dist/index.js \
  --method tools/call \
  --tool-name list_time_entries \
  --tool-arg project_id=1 \
  --tool-arg limit=10
```

**Troubleshooting:**

- **Connection issues**: Verify your Redmine server is running and accessible:

  ```bash
  curl -H "X-Redmine-API-Key: $REDMINE_API_KEY" \
       "$REDMINE_HOST/projects.json"
  ```

- **Permission errors**: Some operations require administrator privileges. Check your API key permissions in Redmine.

- **Environment variables**: Ensure environment variables are properly set:

  ```bash
  echo $REDMINE_API_KEY
  echo $REDMINE_HOST
  ```

- **Build issues**: Make sure the project is built and permissions are set:
  ```bash
  npm run build
  chmod +x dist/index.js
  ls -la dist/index.js
  ```

## Permissions

Some features require administrator privileges:

### User-Related Operations

- `list_users`: Admin required
- `create_user`: Admin required
- `update_user`: Admin required
- `delete_user`: Admin required

Available information varies based on user permission levels. For details, see [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_Users).

## Development

### Requirements

- Node.js 18 or higher
- npm 9 or higher

### Libraries

- `@modelcontextprotocol/sdk`: MCP SDK
- `zod`: Schema validation
- `typescript`: Type system

### Directory Structure

```
.
├── src/
│   ├── tools/            # Tool definitions
│   │   ├── issues.ts
│   │   ├── projects.ts
│   │   ├── time_entries.ts
│   │   └── index.ts
│   ├── formatters/       # Formatters
│   │   ├── issues.ts
│   │   ├── projects.ts
│   │   ├── time_entries.ts
│   │   └── index.ts
│   ├── lib/              # Common libraries
│   │   ├── client.ts     # Redmine API client
│   │   ├── config.ts     # Configuration management
│   │   └── types.ts      # Type definitions
│   ├── handlers.ts       # Request handlers
│   └── index.ts          # Entry point
├── docs/
│   └── adr/              # Architecture Decision Records
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

### Building

```bash
# Install dependencies
npm install

# Build
npm run build

# Start development server
npm run dev
```

### Architecture Decision Records

Major design decisions are documented in `docs/adr`. Refer to these documents when adding or modifying features.

## License

MIT

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine](https://www.redmine.org/)
