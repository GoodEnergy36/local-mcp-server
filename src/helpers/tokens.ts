import { promises as fs } from "node:fs";
import path from "node:path";
import { TokensSchema, type Tokens } from "./types.js";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", ".."); 

const TOKENS_PATH = path.join(rootDir, ".secrets/spotify_tokens.json");

export async function readTokens(): Promise<Tokens> {
  const raw = await fs.readFile(TOKENS_PATH, "utf8");
  const token = JSON.parse(raw);
  TokensSchema.parse(token);
  return token;
}

export async function writeTokens(tokens: Tokens) {
  await fs.mkdir(path.dirname(TOKENS_PATH), { recursive: true });
  await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2), "utf8");
}

export { TOKENS_PATH };
