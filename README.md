# Redmine MCP Server

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

⚠️ **Note**: Currently, the server may crash in the Claude app due to high load. Improvements are under consideration.

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

Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to verify functionality:

```bash
# Build
npm run build

# Set execute permission (important)
chmod +x dist/index.js

# Launch inspector
npx @modelcontextprotocol/inspector dist/index.js
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
│   ├── lib/             # Common libraries
│   │   ├── client.ts     # Redmine API client
│   │   ├── config.ts     # Configuration management
│   │   └── types.ts      # Type definitions
│   ├── handlers.ts       # Request handlers
│   └── index.ts         # Entry point
├── docs/
│   └── adr/             # Architecture Decision Records
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Documentation
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
