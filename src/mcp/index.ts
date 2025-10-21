import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";
import { readTokens, writeTokens } from "../helpers/tokens.js";
import { refreshTokens } from "../backend/spotify.js";
import type { Tokens } from "../helpers/types.js";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
if (!CLIENT_ID) throw new Error("Missing SPOTIFY_CLIENT_ID");

const LEEWAY = 120;

function tokenIsStale(t: Tokens) {
  const now = Math.floor(Date.now() / 1000);
  return t.expires_in <= now + LEEWAY;
}

export async function getUsableSpotifyToken(): Promise<Tokens> {
  // 1) read current
  let t = await readTokens();

  // 2) refresh if needed
  if (tokenIsStale(t)) {
    const res = await refreshTokens({ clientId: CLIENT_ID, refreshToken: t.refresh_token });
    
    t = {
      ...t,
      ...res,
      refresh_token: res.refresh_token ?? t.refresh_token,
      expires_in: Math.floor(Date.now() / 1000) + res.expires_in,
    };

    await writeTokens(t);
  }

  return t;
}

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Server started and listening on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
