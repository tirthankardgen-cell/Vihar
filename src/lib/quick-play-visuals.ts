import type { CSSProperties } from "react";
import type { QuickPlayGame } from "./quick-play";

// The game specifications own preview palettes; released games use their
// shipped UI colours. Keep artwork, catalogue and hero lettering consistent.
type Palette = readonly [paper: string, ink: string, muted: string, accent: string, line: string, heading?: string, body?: string];
const yatra = '"Quick Play Yatra", serif';
const hind = '"Quick Play Hind", sans-serif';
const palettes: Record<QuickPlayGame["visual"]["theme"], Palette> = {
  courtyard: ["#8e4931", "#f5e6c5", "#f2dfbe", "#dfb36d", "#d8c9a880", yatra, hind],
  pool: ["#172d26", "#f5e6c5", "#d8dbc4", "#dfb36d", "#dfb36d60"],
  cloth: ["#f5efdf", "#293958", "#58637a", "#3f5174", "#3f517440"],
  toybox: ["#fff6e3", "#303c39", "#58635a", "#416a91", "#416a9140", "var(--font-dm-sans), sans-serif"],
  keepsakes: ["#faf1e2", "#493d32", "#6b604f", "#906039", "#90603940"],
  desktop: ["#262c30", "#f0ece0", "#cbd6d4", "#8fc4ba", "#8fc4ba60", "ui-monospace, monospace"],
  garden: ["#f4f3e8", "#344a3b", "#5e6d56", "#48634e", "#48634e40"],
  folk: ["#f9efdb", "#493d32", "#6b5848", "#8f5038", "#8f503840"],
  journal: ["#f8f5ed", "#383c40", "#71716c", "#365e83", "#d8d6cc", 'Georgia, "Times New Roman", serif'],
  notebook: ["#faf9f4", "#3c403f", "#666d65", "#3b6d98", "#cfcec3", '"Quick Play Caveat", cursive'],
  airmail: ["#f8f1e4", "#2c445c", "#465d70", "#b96054", "#c9cec8", "Georgia, serif"],
  silk: ["#304b3b", "#f5efdc", "#d6e1c6", "#dfbc88", "#dfbc8860"],
  rain: ["#263b49", "#eee9df", "#c9d9de", "#abd2d0", "#abd2d060"],
  desert: ["#f2e5cb", "#463d32", "#66533e", "#975335", "#97533540"],
  lantern: ["#47384b", "#fff9ee", "#ead8bb", "#e0b967", "#e0b96760"],
  ceramic: ["#f4efe3", "#3b454b", "#4d646c", "#355e82", "#355e8240"],
  optical: ["#283f47", "#efece4", "#cedbdc", "#abc7cf", "#abc7cf60", "ui-monospace, monospace"],
  market: ["#344a69", "#f0e7d4", "#e3d2a9", "#e3d2a9", "#e3d2a960"],
  brass: ["#f5eddc", "#493d2f", "#63543e", "#456f73", "#456f7340"],
  riverstone: ["#eaefe7", "#344a4c", "#4a6260", "#466750", "#46675040"],
  chalk: ["#493d4e", "#fff9ee", "#e9d1cb", "#e9b6aa", "#e9b6aa60"],
  celestial: ["#243b50", "#ede7d6", "#c7dedd", "#d3b777", "#d3b77760"],
};
const releasedPalettes: Record<string, Palette> = {
  chess: ["#293d35", "#f5e6c5", "#e0cfad", "#dfb36d", "#dfb36d60", yatra, hind],
  carrom: ["#173d3a", "#f7edda", "#d9ceb8", "#edcc91", "#d9b87955", yatra, hind],
};

export function quickPlayVisualStyle(game: QuickPlayGame): CSSProperties {
  const [paper, ink, muted, accent, line, heading = "var(--font-newsreader), Georgia, serif", body = "var(--font-dm-sans), sans-serif"] = releasedPalettes[game.id] ?? palettes[game.visual.theme];
  return {
    "--card-paper": paper, "--card-ink": ink, "--card-muted": muted,
    "--card-accent": accent, "--card-line": line,
    "--card-heading": heading, "--card-body": body,
  } as CSSProperties;
}
