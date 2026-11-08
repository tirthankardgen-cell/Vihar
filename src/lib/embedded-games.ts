import type { QuickPlayGame } from "./quick-play";

export const embedChannel = "vihar:embed";
export const embedVersion = 1;
export const embedReadyTimeout = 15_000;
export const embedStopTimeout = 1_500;

type Envelope = { channel: typeof embedChannel; version: typeof embedVersion; gameId: string; sessionId: string };
export type GameEmbedMessage = Envelope & (
  | { type: "ready" | "exit" | "stopped" }
  | { type: "error"; code: "load_failed" | "unsupported" }
);
export type ParentEmbedMessage = Envelope & (
  | { type: "init" | "visibility"; visible: boolean }
  | { type: "stop" }
);

export function readGameEmbedMessage(
  event: Pick<MessageEvent<unknown>, "origin" | "source" | "data">,
  game: Pick<QuickPlayGame, "id" | "allowedOrigin">,
  sessionId: string,
  frameWindow: Window | null,
): GameEmbedMessage | null {
  if (!frameWindow || event.origin !== game.allowedOrigin || event.source !== frameWindow) return null;
  const data = event.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = data as Record<string, unknown>;
  if (value.channel !== embedChannel || value.version !== embedVersion || value.gameId !== game.id || value.sessionId !== sessionId) return null;
  const keys = ["channel", "version", "type", "gameId", "sessionId"];
  if (value.type === "error") {
    if (value.code !== "load_failed" && value.code !== "unsupported") return null;
    keys.push("code");
  } else if (!["ready", "exit", "stopped"].includes(String(value.type))) return null;
  if (Object.keys(value).some((key) => !keys.includes(key))) return null;
  return value as GameEmbedMessage;
}

export function embedMessage(gameId: string, sessionId: string, message: { type: "init" | "visibility"; visible: boolean } | { type: "stop" }): ParentEmbedMessage {
  return { channel: embedChannel, version: embedVersion, gameId, sessionId, ...message };
}

export function assertQuickPlayRelease(game: QuickPlayGame) {
  const url = new URL(game.embedUrl);
  if (game.release.status !== "playable" || !game.release.modes.length || !game.release.devices.length || !game.release.controls.trim() || !Number.isFinite(Date.parse(game.release.verifiedAt))) {
    throw new Error("This game is still coming soon.");
  }
  if (url.protocol !== "https:" || url.origin !== game.allowedOrigin || url.username || url.password || url.pathname === "/" || url.hash) {
    throw new Error("The game address is unavailable.");
  }
}

// The launch service can append only its one-use activity ticket. It cannot
// redirect the iframe to an arbitrary host, catalogue, path or query string.
export function buildEmbedUrl(game: QuickPlayGame, sessionId: string, parentOrigin: string, launchUrl = game.embedUrl) {
  assertQuickPlayRelease(game);
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(sessionId)) throw new Error("Invalid player session.");
  const parent = new URL(parentOrigin);
  if (parent.origin !== parentOrigin || (parent.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(parent.hostname))) throw new Error("Invalid player origin.");
  const url = new URL(launchUrl), expected = new URL(game.embedUrl);
  if (url.origin !== expected.origin || url.pathname !== expected.pathname || url.search !== expected.search || url.username || url.password || (url.hash && !/^#vihar_launch=[A-Za-z0-9_-]{43}$/.test(url.hash))) {
    throw new Error("The game returned an unexpected launch address.");
  }
  url.searchParams.set("vihar_embed", "1");
  url.searchParams.set("vihar_session", sessionId);
  return url.href;
}
