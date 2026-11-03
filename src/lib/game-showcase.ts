import { gameImages } from "@/lib/game-images";

export type GalleryCategory = "gameplay" | "world" | "rides" | "characters";
export type GalleryImage = {
  slug: string;
  src: string;
  title: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  category: GalleryCategory;
  kind: "Gameplay" | "Playable map" | "Concept art" | "3D character" | "3D vehicle" | "World render";
};

const image = (name: string) => `/images/bap-ka-rasta/${name}.webp`;

export const rides = [
  {
    "id": "auto",
    "name": "Auto rickshaw",
    "line": "Teen pahiye. Full street spirit.",
    "type": "Three-wheeler",
    "playable": true,
    "alt": "Black-and-yellow Mumbai auto with open cabin and twin round lamps"
  },
  {
    "id": "thar",
    "name": "Thar",
    "line": "Bade tyre. Full tashan.",
    "type": "Off-road SUV",
    "playable": false,
    "alt": "Orange three-door Thar model with black hardtop and round headlights"
  },
  {
    "id": "fortuner",
    "name": "Fortuner",
    "line": "Entry ho toh aisi.",
    "type": "Large SUV",
    "playable": false,
    "alt": "White Fortuner model with swept headlights and chrome grille"
  },
  {
    "id": "scooty",
    "name": "Dio-style scooter",
    "line": "Chhoti sawaari. Full azaadi.",
    "type": "City scooter",
    "playable": false,
    "alt": "Turquoise Dio-style scooter model with sculpted apron and stepped saddle"
  },
  {
    "id": "ktm",
    "name": "Duke-style KTM",
    "line": "Orange wala josh.",
    "type": "Naked motorcycle",
    "playable": false,
    "alt": "White and orange Duke-style KTM model with exposed trellis frame"
  },
  {
    "id": "toto",
    "name": "Toto e-rickshaw",
    "line": "Electric sawaari. Apna saathi.",
    "type": "Electric rickshaw",
    "playable": false,
    "alt": "Blue open electric rickshaw model with thin canopy and facing passenger benches"
  },
  {
    "id": "best_bus",
    "name": "BEST bus",
    "line": "Sheher ki dhadkan.",
    "type": "City bus",
    "playable": false,
    "alt": "Red BEST bus model with rounded white roof and green route board"
  },
  {
    "id": "sedan",
    "name": "Sedan",
    "line": "Everyday streets. New stories.",
    "type": "Sedan",
    "playable": false,
    "alt": "Light blue sedan model with separate bonnet and boot"
  },
  {
    "id": "taxi",
    "name": "Kaali-peeli taxi",
    "line": "A familiar city companion.",
    "type": "City taxi",
    "playable": false,
    "alt": "Black-and-yellow taxi model with yellow roof and taxi sign"
  },
  {
    "id": "hatchback",
    "name": "Swift-style hatchback",
    "line": "Small car. Big detours.",
    "type": "Hatchback",
    "playable": false,
    "alt": "Red Swift-style compact hatchback game model"
  },
  {
    "id": "wagon",
    "name": "Wagon R-style hatch",
    "line": "Room for another story.",
    "type": "Tall hatchback",
    "playable": false,
    "alt": "Silver Wagon R-style tall hatchback game model"
  },
  {
    "id": "crossover",
    "name": "Creta-style SUV",
    "line": "Your everyday escape.",
    "type": "Compact SUV",
    "playable": false,
    "alt": "White Creta-style compact SUV model with a contrasting dark roof"
  },
  {
    "id": "mpv",
    "name": "Innova-style MPV",
    "line": "Take the long way together.",
    "type": "Family MPV",
    "playable": false,
    "alt": "Silver Innova-style MPV model with a longer three-row cabin"
  }
].map((ride) => ({ ...ride, src: image(`${ride.id}-model`) }));

export const cities = [
  { id: "mumbai", name: "Mumbai", line: "Samundar ki hawa. Kaali-peeli ka swag.", landmark: "Marine Drive · Colaba", playable: true, alt: "Mumbai concept art showing an auto on the palm-lined Marine Drive seafront" },
  { id: "delhi", name: "Delhi", line: "Dilli Boulevard", landmark: "India Gate", playable: false, alt: "Delhi city concept showing a broad boulevard beside India Gate" },
  { id: "kolkata", name: "Kolkata", line: "Hooghly Hop", landmark: "Howrah Bridge", playable: false, alt: "Kolkata city concept with Howrah Bridge, yellow taxis and riverside traffic" },
  { id: "chennai", name: "Chennai", line: "Marina Cruise", landmark: "Marina Beach", playable: false, alt: "Chennai city concept showing a scooter on a sunny palm-lined coastal road" },
  { id: "bangalore", name: "Bangalore", line: "Garden City Run", landmark: "Green avenues", playable: false, alt: "Bangalore city concept showing a motorcycle among green avenues and flowering trees" },
].map((city) => ({ ...city, src: image(city.id === "mumbai" ? city.id : `${city.id}-new`) }));

export const characters = [
  { id: "sachin", name: "Sachin", role: "Your driver", alt: "Sachin's actual 3D character model in a khaki driver's uniform, holding his keys" },
  { id: "raju", name: "Raju Kaka", role: "The auto stand regular", alt: "Raju Kaka's actual 3D character model with silver hair, a khaki uniform and a shoulder towel" },
  { id: "meera", name: "Meera Tai", role: "Your chai stop", alt: "Meera Tai's actual 3D character model in a green sari with a kettle and a cup of chai" },
  { id: "sameer", name: "Sameer", role: "The neighbourhood mechanic", alt: "Sameer's actual 3D character model in blue work clothes holding a spanner" },
  { id: "aarti", name: "Aarti", role: "A familiar face", alt: "Aarti's actual 3D character model in a blue patterned kurta holding a phone" },
  { id: "imran", name: "Imran", role: "On his way through town", alt: "Imran's actual 3D character model in a maroon hoodie carrying a book" },
  { id: "lata", name: "Lata Mavshi", role: "Flowers for your day", alt: "Lata Mavshi's actual 3D character model in a purple sari carrying a basket of flowers" },
  { id: "patil", name: "Constable Patil", role: "Keeping the crossing clear", alt: "Constable Patil's actual 3D character model in a white traffic-police uniform and cap" },
  {"id": "nilesh", "name": "Nilesh", "role": "The dabbawala", "alt": "Nilesh actual 3D character model: White uniform and Gandhi cap, carrying tiffin stacks"},
  {"id": "farah", "name": "Farah", "role": "The fruit seller", "alt": "Farah actual 3D character model: Teal patterned outfit, fruit basket and striped apron"},
  {"id": "suresh", "name": "Suresh", "role": "Your morning news", "alt": "Suresh actual 3D character model: Grey hair, checked shirt, newspapers and shoulder bag"},
  {"id": "pooja", "name": "Pooja", "role": "On her way to care", "alt": "Pooja actual 3D character model: Purple scrubs, ID badge and shoulder bag"},
  {"id": "vikram", "name": "Vikram", "role": "The office commuter", "alt": "Vikram actual 3D character model: Blue shirt, glasses and dark work trousers"},
  {"id": "zoya", "name": "Zoya", "role": "A student on the move", "alt": "Zoya actual 3D character model: Rust jacket, headphones and book"},
  {"id": "bala", "name": "Bala", "role": "The delivery rider", "alt": "Bala actual 3D character model: Orange jacket and black helmet"},
  {"id": "jyoti", "name": "Jyoti", "role": "Keeping the streets bright", "alt": "Jyoti actual 3D character model: Blue uniform, reflective vest, gloves and broom"},
  {"id": "shanta", "name": "Shanta Aaji", "role": "A familiar neighbourhood elder", "alt": "Shanta Aaji actual 3D character model: Blue sari, silver hair, glasses and bangles"},
  {"id": "dev", "name": "Dev", "role": "A visitor with a camera", "alt": "Dev actual 3D character model: Green jacket, camera and folded map"},
  {"id": "asha", "name": "Asha", "role": "Out for a morning walk", "alt": "Asha actual 3D character model: Purple top, black trousers and turquoise water bottle"},
  {"id": "ganesh", "name": "Ganesh", "role": "The market helper", "alt": "Ganesh actual 3D character model: Mustache, ochre shirt and a crate of produce"},
].map((character) => ({ ...character, src: image(character.id) }));

const worldImages: GalleryImage[] = [
  { slug: "creative-garage", src: "/images/bap-ka-rasta-garage-creative.webp", title: "The neighbourhood garage", alt: "Creative game-style garage illustration with the updated vehicle designs and Sameer the mechanic", caption: "Concept art · Generated scene based on the current vehicle models.", width: 1536, height: 1024, category: "rides", kind: "Concept art" },
  { slug: "market-cast", src: "/images/bap-ka-rasta-market-characters.webp", title: "A city is its people", alt: "Creative market scene with Nilesh, Farah, Suresh, Shanta Aaji, Jyoti and other original game characters", caption: "Concept art · Generated scene based on the original 20-character cast.", width: 1536, height: 1024, category: "characters", kind: "Concept art" },

  { slug: "vehicle-library", src: "/images/bap-ka-rasta-vehicle-library.webp", title: "All 13 vehicles", alt: "The complete thirteen-vehicle Blender lineup, including BEST bus, taxi, hatchbacks, SUVs, scooter, KTM and rickshaws", caption: "3D vehicle · Original studio render from the current game model library.", width: 1440, height: 960, category: "rides", kind: "3D vehicle" },
  { slug: "free-roam-artwork", src: "/images/bap-ka-rasta-cover.webp", title: "Your city. Your ride. Your way.", alt: "Bap Ka Rasta promotional artwork with the updated vehicle lineup and blocky characters on a golden Indian city avenue", caption: "Concept art · Generated promotional scene based on the game's current vehicles and character style.", width: 1536, height: 1024, category: "world", kind: "Concept art" },
  { slug: "chai-characters", src: "/images/bap-ka-rasta-chai-characters.webp", title: "A little chai. A lot of stories.", alt: "Promotional illustration of Sachin, Raju Kaka, Meera Tai and Sameer sharing chai beside a street stall", caption: "Concept art · Promotional illustration based on the original character models, not a gameplay capture.", width: 1536, height: 1024, category: "characters", kind: "Concept art" },
  ...[
    { slug: "01-free-roam-launch", title: "Your city. Your ride. Your way.", alt: "Vihar launch poster for Bap Ka Rasta with the official BR badge and free-roaming city artwork", category: "world" as const, caption: "Promotional poster · Original logos and game typography with generated concept art." },
    { slug: "02-meet-the-vehicles", title: "13 rides. One living world.", alt: "Bap Ka Rasta vehicle poster featuring the actual thirteen-model library and official BR badge", category: "rides" as const, caption: "Promotional poster · Actual vehicle model lineup with original branding." },
    { slug: "03-meet-the-mohalla", title: "Meet the mohalla", alt: "Vihar character poster with Sachin, Raju Kaka, Meera Tai and Sameer sharing chai", category: "characters" as const, caption: "Promotional poster · Generated character scene with original branding." },
  ].map((poster): GalleryImage => ({ ...poster, src: `/images/bap-ka-rasta-${poster.slug}.webp`, width: 864, height: 1080, kind: "Concept art" })),

  { slug: "updated-city", src: "/images/bap-ka-rasta-city-preview.webp", title: "A bigger world to wander", alt: "Updated Mumbai-inspired game world render showing the expanded city layout and landmark buildings", caption: "World render · Updated city from the game repository, November 2026.", width: 1400, height: 1469, category: "world", kind: "World render" },
  { slug: "mumbai-chowk", src: "/images/bap-ka-rasta-mumbai-chowk.webp", title: "Meet at Mumbai Chowk", alt: "Game world render of the central Mumbai Chowk roundabout and its connected roads", caption: "World render · The central roundabout in the updated map.", width: 1400, height: 972, category: "world", kind: "World render" },
  { slug: "neighbourhood-roundabouts", src: "/images/bap-ka-rasta-roundabouts.webp", title: "Take another turn", alt: "Game world renders of smaller garden roundabouts in the updated city", caption: "World render · Smaller neighbourhood roundabouts from the updated map.", width: 1400, height: 569, category: "world", kind: "World render" },

  { slug: "mumbai-street-scene", src: image("street-scene"), title: "A city with company", alt: "Rendered game assets showing Mumbai buildings, characters, an auto, taxi and red bus together at street scale", caption: "World render · Mumbai buildings, people and traffic from the game.", width: 1100, height: 649, category: "world", kind: "World render" },
  ...[
    { id: "taj", title: "Taj Mahal Palace", alt: "Original 3D game interpretation of the Taj Mahal Palace with red domes and a cream facade" },
    { id: "gateway", title: "Gateway of India", alt: "Original 3D game interpretation of the Gateway of India with its central stone arch" },
    { id: "csmt", title: "CSMT", alt: "Original 3D game interpretation of Mumbai's CSMT station with a dome and red-roofed towers" },
  ].map((landmark): GalleryImage => ({ slug: landmark.id, src: image(landmark.id), title: landmark.title, alt: landmark.alt, caption: "World render · A Mumbai landmark from the game's model library.", width: 480, height: 360, category: "world", kind: "World render" })),
];

export const galleryImages: GalleryImage[] = [
  ...gameImages.map((item): GalleryImage => ({ ...item, category: item.slug === "playable-map" ? "world" : "gameplay", kind: item.slug === "playable-map" ? "Playable map" : "Gameplay" })),
  ...cities.map((city): GalleryImage => ({ slug: `${city.id}-concept`, src: city.src, title: city.name, alt: city.alt, caption: `City concept · ${city.playable ? "Available in the current build; this image is concept artwork." : "Coming soon. This city is a preview, with no release date announced."}`, width: city.id === "mumbai" ? 498 : 768, height: city.id === "mumbai" ? 344 : 512, category: "world", kind: "Concept art" })),
  ...worldImages,
  ...rides.map((ride): GalleryImage => ({ slug: `${ride.id}-model`, src: ride.src, title: ride.name, alt: ride.alt, caption: `3D vehicle · Rendered directly from the game's current model library. ${ride.playable ? "Player-selectable in the current build." : "Present in city traffic; player selection is not yet available."}`, width: 768, height: 768, category: "rides", kind: "3D vehicle" })),
  ...characters.map((character): GalleryImage => ({ slug: character.id, src: character.src, title: character.name, alt: character.alt, caption: `3D character · ${character.role}. Rendered from the game's character models.`, width: 384, height: 460, category: "characters", kind: "3D character" })),
];

export const gameplayImages = galleryImages.filter((item) => item.category === "gameplay");
