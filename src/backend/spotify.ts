import { TokensSchema, type Tokens } from "../helpers/types.js"

const TOKEN_URL = "https://accounts.spotify.com/api/token";

export async function exchangeCodeForTokens(
  clientId: string,
  redirectUri: string,
  code: string,
  codeVerifier: string
): Promise<Tokens> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Token exchange failed: ${r.status} ${txt}`);
  }

  const tokens = await r.json();

  TokensSchema.parse(tokens);
  
  return tokens;
}

export async function refreshTokens(params: {
  clientId: string;
  refreshToken: string;
}) {
  const body = new URLSearchParams({
    client_id: params.clientId,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Refresh failed: ${r.status} ${txt}`);
  }
  return (await r.json()) as {
    access_token: string;
    token_type: string;
    scope?: string;
    expires_in: number;
    refresh_token?: string; // sometimes returned again
  };
}
