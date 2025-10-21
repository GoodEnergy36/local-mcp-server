import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { readTokens } from "../helpers/tokens.js";

export const server = new Server({
    name: "my-mcp-server",
    version: "1.0.0"
  }, {
    capabilities: {
      resources: {},
      tools: {},
    }
});

const RESOURCE_URI = "hash://application-logs";

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: RESOURCE_URI,
        name: "Application Logs",
        mimeType: "text/plain"
      }
    ]
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri !== RESOURCE_URI) {
    throw new Error("Resource not found");
  }

  const logContents = await readTokens();
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: logContents.scope
      }
    ]
  };
});
