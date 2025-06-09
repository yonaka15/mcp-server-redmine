import {
  CallToolResult,
  TextContent,
  ImageContent,
  EmbeddedResource,
  TextResourceContents
  // BlobResourceContents // Removed as it's unused
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Asserts that a response conforms to the MCP CallToolResult schema
 */
export function assertMcpToolResponse(response: unknown): void {
  // 全体構造の検証
  expect(response).toHaveProperty('content');
  expect(response).toHaveProperty('isError');
  
  const typedResponse = response as CallToolResult;
  
  // content配列の検証
  expect(Array.isArray(typedResponse.content)).toBe(true);
  expect(typedResponse.content.length).toBeGreaterThan(0);
  
  // 各contentアイテムの検証
  typedResponse.content.forEach(item => {
    expect(item).toHaveProperty('type');
    
    switch (item.type) {
      case 'text':
        expect(item).toHaveProperty('text');
        expect(typeof (item as TextContent).text).toBe('string');
        expect((item as TextContent).text.length).toBeGreaterThan(0);
        break;
        
      case 'image':
        expect(item).toHaveProperty('data');
        expect(item).toHaveProperty('mimeType');
        expect(typeof (item as ImageContent).data).toBe('string');
        expect(typeof (item as ImageContent).mimeType).toBe('string');
        break;
        
      case 'resource': { // Added block scope for lexical declaration
        expect(item).toHaveProperty('resource');
        const resourceItem = item as EmbeddedResource; // Lexical declaration
        expect(resourceItem.resource).toHaveProperty('uri');
        if ('text' in resourceItem.resource) {
          expect(typeof resourceItem.resource.text).toBe('string');
        } else {
          expect(typeof (resourceItem.resource as { blob: string }).blob).toBe('string'); // Added type assertion for blob
        }
        break;
      }
      default:
        // Optionally handle unknown types or let it pass if other types are allowed
        break;
    }
  });
}

export type MakeContentItem = {
  text: TextContent;
  image: ImageContent;
  resource: EmbeddedResource;
};

function createTextContent(content: string): TextContent {
  return {
    type: "text",
    text: content
  };
}

function createImageContent(content: string): ImageContent {
  return {
    type: "image",
    data: Buffer.from(content).toString('base64'),
    mimeType: "image/png"
  };
}

function createResourceContent(content: string): EmbeddedResource {
  const resource: TextResourceContents = { // Explicitly type resource
    uri: content, // Assuming content is URI for resource for this helper
    mimeType: "text/plain",
    text: content
  };

  return {
    type: "resource",
    resource
  };
}

/**
 * Creates a valid MCP tool response fixture for testing
 */
export function createMcpToolResponseFixture<T extends keyof MakeContentItem>(
  content: string,
  type: T = 'text' as T,
  isError = false
): CallToolResult {
  let contentItem: MakeContentItem[T];

  switch (type) {
    case "text":
      contentItem = createTextContent(content) as MakeContentItem[T];
      break;
    case "image":
      contentItem = createImageContent(content) as MakeContentItem[T];
      break;
    case "resource":
      contentItem = createResourceContent(content) as MakeContentItem[T];
      break;
    default:
      throw new Error(`Unsupported content type: ${type}`);
  }

  return {
    content: [contentItem],
    isError
  };
}
