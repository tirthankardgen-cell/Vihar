/* eslint-disable @next/next/no-img-element -- ImageResponse renders SVG assets into a PNG; next/image cannot render here. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getProfileCardData } from "@/lib/account/profile-card-data";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const profile = await getProfileCardData((await params).username);
    if (!profile) return new Response("Player not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
    const download = new URL(request.url).searchParams.get("download") === "1";
    const [portrait, emblem] = await Promise.all([
      readFile(join(process.cwd(), "public", "avatars", `${profile.avatarId}.svg`)),
      readFile(join(process.cwd(), "public", "brand", "vihar-emblem-inverse.svg")),
    ]);
    const nameSize = profile.displayName.length > 24 ? 44 : profile.displayName.length > 15 ? 54 : 64;
    const card = <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, width: 820, height: 1120, background: "#1c1b19", border: "2px solid #756044", borderRadius: 28, padding: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 30, borderBottom: "1px solid #4d4437" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><img src={`data:image/svg+xml;base64,${emblem.toString("base64")}`} width={49} height={52} alt="" /><span style={{ fontSize: 32, letterSpacing: 7 }}>VIHAR</span><span style={{ color: "#e5b47c", fontSize: 24 }}>ID</span></div>
        <span style={{ fontSize: 14, letterSpacing: 2, color: "#c8b99f" }}>PLAYER CARD</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minWidth: 0 }}>
        <img src={`data:image/svg+xml;base64,${portrait.toString("base64")}`} width={296} height={296} alt="" style={{ borderRadius: "50%", border: "7px solid #4b4031", marginBottom: 36 }} />
        <span style={{ color: "#b8afa1", fontSize: 14, letterSpacing: 4, marginBottom: 22 }}>VIHAR PLAYER</span>
        <div style={{ display: "flex", justifyContent: "center", width: "100%", fontSize: nameSize, fontWeight: 600, lineHeight: 1.13, letterSpacing: -1, textAlign: "center", wordBreak: "break-word" }}>{profile.displayName}</div>
        <span style={{ color: "#e5b47c", fontSize: 30, marginTop: 20 }}>@{profile.username}</span>
        {profile.joined && <span style={{ color: "#b8afa1", fontSize: 21, marginTop: 30 }}>Member since {profile.joined}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 19, borderTop: "1px solid #4d4437", paddingTop: 30 }}>
        <span style={{ color: "#d1c4b1", fontSize: 23 }}>vihar.online/u/{profile.username}</span>
        <span style={{ color: "#b5a997", fontSize: 14, letterSpacing: 3 }}>YOUR GAMES. YOUR IDENTITY.</span>
      </div>
    </div>;

    return new ImageResponse(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#111111", padding: 40, color: "#f2f0eb", fontFamily: "sans-serif" }}>
        {card}
      </div>,
      {
        width: 900,
        height: 1200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          "Content-Disposition": `${download ? "attachment" : "inline"}; filename="vihar-${profile.username}-id.png"`,
          "X-Robots-Tag": "noindex",
        },
      },
    );
  } catch {
    return new Response("This Vihar ID card is temporarily unavailable. Please try again.", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }
}
