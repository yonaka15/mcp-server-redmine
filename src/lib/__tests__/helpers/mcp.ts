import { 
  CallToolResult, 
  TextContent, 
  ImageContent, 
  EmbeddedResource,
  TextResourceContents,
  // BlobResourceContents // Removed
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Asserts that a response conforms to the MCP CallToolResult schema
 */
export function assertMcpToolResponse(response: unknown): void {
  // 総合的な検証
  expect(response).toHaveProperty('content');
  expect(response).toHaveProperty('isError');
  
  const typedResponse = response as CallToolResult;
  
  // コンテント配列の検証
  expect(Array.isArray(typedResponse.content)).toBe(true);
  expect(typedResponse.content.length).toBeGreaterThan(0);
  
  // 各コンテントアイテムの検証
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
        
      case 'resource': {
        expect(item).toHaveProperty('resource');
        const resourceItem = item as EmbeddedResource;
        expect(resourceItem.resource).toHaveProperty('uri');
        if ('text' in resourceItem.resource) {
          expect(typeof resourceItem.resource.text).toBe('string');
        } else {
          expect(typeof resourceItem.resource.blob).toBe('string');
        }
        break;
      }
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
  const resource: TextResourceContents = {
    uri: content,
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
export function createMcpToolResponseFixture<
  T extends keyof MakeContentItem
>(
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
