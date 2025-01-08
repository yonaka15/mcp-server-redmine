import { z } from 'zod';
import {
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResponseSchema,
  JSONRPCErrorSchema,
  ServerRequestSchema,
  ServerNotificationSchema,
  ServerResultSchema,
  type ServerRequest,
  type ServerNotification,
  type ServerResult
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Base MCP schema based on JSON-RPC 2.0
 */
export const BaseMCPSchema = JSONRPCRequestSchema.omit({ id: true });

/**
 * MCP Request schema
 */
export const MCPRequestSchema = ServerRequestSchema;

/**
 * MCP Notification schema
 */
export const MCPNotificationSchema = ServerNotificationSchema;

/**
 * MCP Response schema
 */
export const MCPResponseSchema = JSONRPCResponseSchema;

/**
 * MCP Error schema
 */
export const MCPErrorSchema = JSONRPCErrorSchema;

/**
 * MCP Server Request schema
 */
export const MCPServerRequestSchema = ServerRequestSchema;

/**
 * MCP Server Notification schema
 */
export const MCPServerNotificationSchema = ServerNotificationSchema;

/**
 * MCP Server Result schema
 */
export const MCPServerResultSchema = ServerResultSchema;

// Export unified schema object
export const schema = {
  base: BaseMCPSchema,
  request: MCPRequestSchema,
  notification: MCPNotificationSchema,
  response: MCPResponseSchema,
  error: MCPErrorSchema,
  serverRequest: MCPServerRequestSchema,
  serverNotification: MCPServerNotificationSchema,
  serverResult: MCPServerResultSchema,
} as const;

// Export type aliases using SDK types
export type MCPRequest = ServerRequest;
export type MCPNotification = ServerNotification;
export type MCPResponse = z.infer<typeof MCPResponseSchema>;
export type MCPError = z.infer<typeof MCPErrorSchema>;
export type MCPServerRequest = ServerRequest;
export type MCPServerNotification = ServerNotification;
export type MCPServerResult = ServerResult;