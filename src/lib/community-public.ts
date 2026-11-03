// Public Firestore REST reads obey the same security rules as the browser.
// No service-account credential is needed or used for search indexing.
import { cache } from "react";
import type { CommunityGame } from "@/lib/community";

type PublicDocument = { name: string; fields: Record<string, { stringValue?: string; booleanValue?: boolean; timestampValue?: string }> };
export type PublicGame = CommunityGame & { updatedAt: string };
function decode(document: PublicDocument): PublicGame {
  const fields = document.fields;
  return { id: document.name.split("/").at(-1)!, ownerId: fields.ownerId.stringValue!, title: fields.title.stringValue!, description: fields.description.stringValue!, url: fields.url.stringValue!, kind: fields.kind?.stringValue === "download" ? "download" : "browser", published: fields.published.booleanValue === true, updatedAt: fields.updatedAt.timestampValue! };
}
function endpoint() {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return project ? `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents` : null;
}
export async function publicGames(): Promise<PublicGame[]> {
  const base = endpoint();
  if (!base) return [];
  const response = await fetch(`${base}:runQuery`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "communityGames" }], where: { fieldFilter: { field: { fieldPath: "published" }, op: "EQUAL", value: { booleanValue: true } } } } }),
    next: { revalidate: 300 },
  });
  // Do not cache an empty sitemap when the backend is unavailable.
  if (!response.ok) throw new Error(`Public game index unavailable (${response.status})`);
  const rows = await response.json() as { document?: PublicDocument }[];
  return rows.flatMap((row) => row.document ? [decode(row.document)] : []);
}
export const publicGame = cache(async (id: string): Promise<PublicGame | null> => {
  const base = endpoint();
  if (!base || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  const response = await fetch(`${base}/communityGames/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (response.status === 403 || response.status === 404) return null;
  if (!response.ok) throw new Error(`Public game unavailable (${response.status})`);
  const game = decode(await response.json() as PublicDocument);
  return game.published ? game : null;
});
