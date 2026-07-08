import { createSign } from "crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

interface CachedToken {
  token: string;
  expiresAt: number;
}

// Reused across invocations on a warm serverless instance to avoid minting
// a fresh token on every request; irrelevant on cold starts.
let cached: CachedToken | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

async function fetchAccessToken(): Promise<string> {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  // Env vars can't hold literal newlines cleanly, so the key is stored with
  // escaped \n sequences and unescaped here.
  const privateKey = requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.token;
  }
  const token = await fetchAccessToken();
  cached = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function listImagesInFolder(folderId: string): Promise<DriveFile[]> {
  const token = await accessToken();
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
  );
  const res = await fetch(
    `${DRIVE_API}/files?q=${query}&fields=files(id,name,mimeType)&pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    throw new Error(`Drive list failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const token = await accessToken();
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Drive download failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
