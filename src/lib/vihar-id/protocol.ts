import { createHash, randomBytes } from "node:crypto";

export class IdError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) { super(message); this.code = code; this.status = status; }
}
export const secret = () => randomBytes(32).toString("base64url");
export const digest = (value: string) => createHash("sha256").update(value).digest("base64url");
export function requireString(value: unknown, name: string, pattern = /^[A-Za-z0-9_-]{1,128}$/) {
  if (typeof value !== "string" || !pattern.test(value)) throw new IdError("invalid_request", `Invalid ${name}.`);
  return value;
}
export function gameOrigin(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) throw new IdError("invalid_origin", "Enter your game's HTTPS origin.");
  let url: URL;
  try { url = new URL(value); } catch { throw new IdError("invalid_origin", "Enter your game's HTTPS origin."); }
  const local = process.env.VIHAR_ID_EMULATOR === "true" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if ((!local && (url.protocol !== "https:" || !url.hostname.includes(".") || !!url.port)) || (local && !["http:", "https:"].includes(url.protocol)) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new IdError("invalid_origin", "Use an exact HTTPS origin without a path, query, or credentials.");
  return url.origin;
}
// Credit only recent elapsed time. The client cannot supply lifetime totals.
export function creditedMilliseconds(elapsed: unknown, previous: number, now: number) {
  if (!Number.isSafeInteger(elapsed) || Number(elapsed) < 0 || Number(elapsed) > 45_000) throw new IdError("invalid_duration", "elapsedMs must be an integer between 0 and 45000.");
  const gap = now - previous;
  return gap < 0 || gap > 90_000 ? 0 : Math.min(Number(elapsed), gap, 45_000);
}
export function progressData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new IdError("invalid_save", "Progress must be a JSON object.");
  const json = JSON.stringify(value);
  if (Buffer.byteLength(json) > 60_000) throw new IdError("save_too_large", "Progress must be under 60 KB.", 413);
  return json;
}
