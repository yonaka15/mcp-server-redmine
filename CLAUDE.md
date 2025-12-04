# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Run in development mode (with watch)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint
```

## Environment Variables

Required environment variables for development and testing:
- `REDMINE_API_KEY`: API key from Redmine user settings
- `REDMINE_HOST`: Redmine server URL (e.g., `https://redmine.example.com`)

## Architecture Overview

This is an MCP (Model Context Protocol) server that integrates with Redmine's REST API. The server exposes Redmine functionality as MCP tools that can be called by LLMs.

### Core Flow

1. **Entry Point** (`src/index.ts`): Bootstraps the server via `runServer()`
2. **Server Setup** (`src/handlers/index.ts`): Creates the MCP server, registers all tools, and handles tool execution routing
3. **Tool Execution**: Incoming tool calls are routed through a handler map to resource-specific handlers

### Module Structure

**Tools** (`src/tools/`): Define MCP tool schemas with names, descriptions, and input validation. Each file exports `*_TOOL` constants (e.g., `ISSUE_LIST_TOOL`, `PROJECT_CREATE_TOOL`). Tools are automatically discovered and registered.

**Handlers** (`src/handlers/`): Implement tool logic. Each resource has a `create*Handlers()` function that returns an object mapping tool names to handler functions. Handlers receive a `HandlerContext` with the Redmine client, config, and logger.

**Client** (`src/lib/client/`): Wraps Redmine REST API calls. `BaseClient` provides `performRequest()` for HTTP operations and `encodeQueryParams()` for query string building. Resource-specific clients extend `BaseClient`.

**Types** (`src/lib/types/`): TypeScript types and Zod schemas for each resource domain (issues, projects, time_entries, users). Each has:
- `types.ts`: TypeScript interfaces
- `schema.ts`: Zod validation schemas
- `index.ts`: Re-exports

**Formatters** (`src/formatters/`): Convert Redmine API responses to human-readable text for MCP tool responses.

**Config** (`src/lib/config.ts`): Loads and validates environment variables using Zod.

### Adding a New Tool

1. Add tool definition in `src/tools/<resource>.ts` (export `*_TOOL` constant)
2. Add export in `src/tools/index.ts`
3. Implement handler in `src/handlers/<resource>.ts`
4. If new resource: create client in `src/lib/client/`, types in `src/lib/types/`, formatter in `src/formatters/`

### Testing

Tests use Jest with `node-fetch` mocks. Test files are located in `__tests__/` directories adjacent to the code they test. Only GET operations are included in tests for data safety.
