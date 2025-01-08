import type {
  ServerRequest,
  ServerNotification,
  ServerResult,
  Tool,
  SamplingMessage,
  LoggingLevel
} from '@modelcontextprotocol/sdk/types.js';

// Valid ping request
export const validPingRequest: ServerRequest = {
  method: 'ping',
  params: {
    _meta: {
      progressToken: "123"
    }
  }
};

// Valid progress notification
export const validProgressNotification: ServerNotification = {
  method: 'notifications/progress',
  params: {
    _meta: {},
    progressToken: "123",
    progress: 50,
    total: 100
  }
};

// Valid empty result
export const validEmptyResult: ServerResult = {
  _meta: {}
};

// Valid tools result
export const validToolsResult: ServerResult = {
  tools: [{
    name: "test-tool",
    description: "Test tool",
    inputSchema: {
      type: "object",
      properties: {}
    }
  } satisfies Tool]
};

// Valid logging message notification
export const validLoggingNotification: ServerNotification = {
  method: "notifications/message",
  params: {
    _meta: {},
    level: "info" as LoggingLevel,
    data: "test message",
    logger: "test"
  }
};