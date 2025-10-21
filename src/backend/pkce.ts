// PKCE helpers for OAuth2 flows

const rand = (n: number) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
};

const sha256 = (s: string) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export { rand, sha256, b64url };