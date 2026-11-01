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
    const preview = new URL(request.url).searchParams.get("format") === "preview";
    const [portrait, emblem] = await Promise.all([
      readFile(join(process.cwd(), "public", "avatars", `${profile.avatarId}.svg`)),
      readFile(join(process.cwd(), "public", "brand", "vihar-emblem-inverse.svg")),
    ]);
    const px = (value: number) => value * (preview ? 0.49 : 1);
    const nameSize = profile.displayName.length > 24 ? 44 : profile.displayName.length > 15 ? 54 : 64;
    const card = <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, width: px(820), height: px(1120), background: "#1c1b19", border: `${px(2)}px solid #756044`, borderRadius: px(28), padding: px(48) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: px(30), borderBottom: "1px solid #4d4437" }}>
        <div style={{ display: "flex", alignItems: "center", gap: px(18) }}><img src={`data:image/svg+xml;base64,${emblem.toString("base64")}`} width={px(49)} height={px(52)} alt="" /><span style={{ fontSize: px(32), letterSpacing: px(7) }}>VIHAR</span><span style={{ color: "#e5b47c", fontSize: px(24) }}>ID</span></div>
        <span style={{ fontSize: px(14), letterSpacing: px(2), color: "#c8b99f" }}>PLAYER CARD</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minWidth: 0 }}>
        <img src={`data:image/svg+xml;base64,${portrait.toString("base64")}`} width={px(296)} height={px(296)} alt="" style={{ borderRadius: "50%", border: `${px(7)}px solid #4b4031`, marginBottom: px(36) }} />
        <span style={{ color: "#b8afa1", fontSize: px(14), letterSpacing: px(4), marginBottom: px(22) }}>VIHAR PLAYER</span>
        <div style={{ display: "flex", justifyContent: "center", width: "100%", fontSize: px(nameSize), fontWeight: 600, lineHeight: 1.13, letterSpacing: px(-1), textAlign: "center", wordBreak: "break-word" }}>{profile.displayName}</div>
        <span style={{ color: "#e5b47c", fontSize: px(30), marginTop: px(20) }}>@{profile.username}</span>
        {profile.joined && <span style={{ color: "#b8afa1", fontSize: px(21), marginTop: px(30) }}>Member since {profile.joined}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: px(19), borderTop: "1px solid #4d4437", paddingTop: px(30) }}>
        <span style={{ color: "#d1c4b1", fontSize: px(23) }}>vihar.online/u/{profile.username}</span>
        <span style={{ color: "#b5a997", fontSize: px(14), letterSpacing: px(3) }}>YOUR GAMES. YOUR IDENTITY.</span>
      </div>
    </div>;

    return new ImageResponse(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 70, width: "100%", height: "100%", background: "#111111", padding: 40, color: "#f2f0eb", fontFamily: "sans-serif" }}>
        {card}
        {preview && <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ color: "#c7bba9", fontSize: 15, letterSpacing: 4, marginBottom: 26 }}>MY VIHAR ID</span>
          <div style={{ display: "flex", fontSize: profile.displayName.length > 24 ? 40 : 48, fontWeight: 600, lineHeight: 1.15, wordBreak: "break-word" }}>{profile.displayName}</div>
          <span style={{ color: "#e5b47c", fontSize: 27, marginTop: 19 }}>@{profile.username}</span>
          <span style={{ color: "#c4bcae", fontSize: 23, marginTop: 44 }}>Your games. Your identity.</span>
          <span style={{ color: "#aaa294", fontSize: 18, marginTop: 17 }}>vihar.online/u/{profile.username}</span>
        </div>}
      </div>,
      {
        width: preview ? 1200 : 900,
        height: preview ? 630 : 1200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          "Content-Disposition": `inline; filename="vihar-${profile.username}-${preview ? "preview" : "id"}.png"`,
          "X-Robots-Tag": "noindex",
        },
      },
    );
  } catch {
    return new Response("This Vihar ID card is temporarily unavailable. Please try again.", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }
}
