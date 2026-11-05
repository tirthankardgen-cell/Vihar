// Artwork from the deployed Gulam Chor game; captures and provenance in development.md.
export const gulamFamily = [
  { id: "you", name: "You", hindi: "आप", role: "Your place at the table", alt: "Illustrated portrait of you, the human player" },
  { id: "dadi", name: "Dadi", hindi: "दादी", role: "The family favourite", alt: "Dadi, the virtual family grandmother, with glasses and a lavender sari" },
  { id: "meera", name: "Meera", hindi: "मीरा", role: "Always one step ahead", alt: "Meera, a virtual player, in a yellow outfit" },
  { id: "raju", name: "Raju", hindi: "राजू", role: "A little too confident", alt: "Raju, a virtual player, with a moustache and a blue shirt" },
  { id: "amma", name: "Amma", hindi: "अम्मा", role: "Knows all your tricks", alt: "Amma, a virtual family player in a warm terracotta sari" },
  { id: "kabir", name: "Kabir", hindi: "कबीर", role: "Here for the chai", alt: "Kabir, a virtual player, in a light blue shirt" },
] as const;

export const gulamScreenshots = [
  { src: "/images/gulam-chor/table.webp", title: "The evening baithak", alt: "Actual Gulam Chor desktop gameplay with Dadi, Meera and Raju around a green patterned table, hidden cards to draw, and your hand below", caption: "Actual browser gameplay · You and three virtual family players.", width: 1280, height: 720 },
  { src: "/images/gulam-chor/table-mobile.webp", title: "A little round, on your phone", alt: "Actual Gulam Chor mobile gameplay with the virtual family, a fan of face-down cards and your hand", caption: "Actual browser gameplay · Touch controls at phone width.", width: 390, height: 844 },
] as const;
