export type GameDetails = { title: string; description: string; url: string; kind: "browser" | "download"; coverUrl: string; screenshots: string[]; howToPlay: string; controls: string; requirements: string; genre: string; authMode: "none" | "vihar-id" };
export const emptyGameDetails: GameDetails = { title: "", description: "", url: "", kind: "browser", coverUrl: "", screenshots: [], howToPlay: "", controls: "", requirements: "", genre: "", authMode: "none" };
export function gameUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" || url.username || url.password || url.port || !/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(url.hostname)) throw new Error("Use a public HTTPS URL without a port or login details.");
  return url.href;
}
export function validateGameDetails(data: GameDetails, publish: boolean): GameDetails {
  if (data.authMode !== undefined && !["none", "vihar-id"].includes(data.authMode)) throw new Error("Choose direct play or Vihar ID login.");
  const result = { ...data, title: data.title.trim(), description: data.description.trim(), url: gameUrl(data.url), coverUrl: data.coverUrl.trim() ? gameUrl(data.coverUrl) : "", screenshots: data.screenshots.filter((url) => url.trim()).map(gameUrl) };
  for (const [field, max] of Object.entries({ title: 80, description: 2000, howToPlay: 3000, controls: 1000, requirements: 1000, genre: 60, url: 2048, coverUrl: 2048 })) {
    if (result[field as keyof GameDetails].length > max) throw new Error(`${field} is too long (maximum ${max} characters).`);
  }
  if (!result.title || !result.description) throw new Error("Add a game name and description.");
  if (result.screenshots.length > 6 || result.screenshots.some((url) => url.length > 2048)) throw new Error("Add up to six screenshot URLs, each under 2,048 characters.");
  if (publish && (!result.coverUrl || !result.howToPlay.trim())) throw new Error("Add a cover image and how-to-play instructions before publishing.");
  return result;
}
