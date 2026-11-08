import { idAction } from "@/lib/vihar-id/service";
import { IdError } from "@/lib/vihar-id/protocol";

export const runtime = "nodejs";
const actions = new Set(["register", "info", "authorize", "launch", "receipt", "disconnect", "token", "me", "save", "session", "revoke"]);
function headers(request: Request) {
  return { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Access-Control-Allow-Origin": request.headers.get("origin") || "null", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Vary": "Origin", "Referrer-Policy": "no-referrer" };
}
export function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: headers(request) }); }
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (!actions.has(action)) throw new IdError("unknown_action", "Unknown Vihar ID action.", 404);
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new IdError("invalid_request", "Use application/json.", 415);
    // Bound chunked bodies too; never rely only on Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new IdError("invalid_request", "Supply a JSON body.");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 65_536) { await reader.cancel(); throw new IdError("request_too_large", "The request is too large.", 413); } chunks.push(value); }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new IdError("invalid_request", "Supply valid JSON."); }
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new IdError("invalid_request", "Supply a JSON object.");
    return Response.json(await idAction(action, input, request), { headers: headers(request) });
  } catch (error) {
    const known = error instanceof IdError;
    // Do not log request bodies, credentials, codes, or saves.
    if (!known) console.error("Vihar ID service unavailable", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: known ? error.code : "service_unavailable", message: known ? error.message : "Vihar ID is temporarily unavailable. Please try again later." }, { status: known ? error.status : 503, headers: headers(request) });
  }
}
