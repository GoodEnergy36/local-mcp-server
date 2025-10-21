import http from "node:http";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { rand, sha256, b64url } from "./pkce.js";
import { exchangeCodeForTokens } from "./spotify.js";

const PORT = 8080;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
if (!CLIENT_ID) throw new Error("Missing SPOTIFY_CLIENT_ID");

const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

const SECRETS_DIR = path.resolve(".secrets");
const PKCE_PATH = path.join(SECRETS_DIR, "pkce.json");
const TOKENS_PATH = path.join(SECRETS_DIR, "spotify_tokens.json");

const app = express();
app.use(express.json());

// Serve static pages
app.get("/request", (_req, res) => {
  res.sendFile(path.resolve("ui/request.html"));
});

app.get("/authorised", (_req, res) => {
  res.sendFile(path.resolve("ui/authorised.html"));
});

app.get("/", async (_req, res) => {
  const state = rand(32);
  const verifier = rand(80);
  const challenge = b64url(await sha256(verifier));

  fs.mkdirSync(SECRETS_DIR, { recursive: true });
  fs.writeFileSync(PKCE_PATH, JSON.stringify({ state, verifier }), "utf8");

  const scope = "user-read-email user-read-private";
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope,
  }).toString();

  res.redirect(authUrl.toString());
});

app.get("/callback", async (req, res) => {
  const code = (req.query.code as string) || "";
  const state = (req.query.state as string) || "";
  if (!code || !state) return res.status(400).send("Missing code or state");

  let verifier = "";
  try {
    const { state: savedState, verifier: savedVerifier } = JSON.parse(
      fs.readFileSync(PKCE_PATH, "utf8")
    );
    if (savedState !== state) return res.status(400).send("Invalid state");
    verifier = savedVerifier;
  } catch {
    return res.status(400).send("Missing PKCE state/verifier");
  }

  const tokens = await exchangeCodeForTokens(CLIENT_ID, REDIRECT_URI, code, verifier);
  const expires_in = Math.floor(Date.now() / 1000) + tokens.expires_in;

  fs.writeFileSync(
    TOKENS_PATH,
    JSON.stringify({ ...tokens, expires_in }, null, 2),
    "utf8"
  );

  res.redirect("/authorised");
});

http.createServer(app).listen(PORT, "127.0.0.1", () => {
  console.log(`OAuth2 PKCE server listening at http://127.0.0.1:${PORT}`);
  console.log(`Make sure Spotify Redirect URI = http://127.0.0.1:${PORT}/callback`);
});
