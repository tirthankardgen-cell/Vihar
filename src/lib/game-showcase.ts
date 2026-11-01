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
  kind: "Gameplay" | "Playable map" | "Concept art" | "3D character" | "World render";
};

const image = (name: string) => `/images/bap-ka-rasta/${name}.webp`;

export const rides = [
  { id: "auto", name: "Auto rickshaw", line: "Teen pahiye. Full Mumbai swag.", type: "Three-wheeler", playable: true, alt: "Black-and-yellow Mumbai auto rickshaw with a rounded canopy and three wheels" },
  { id: "thar", name: "Thar", line: "Bade tyre. Full tashan.", type: "Off-road SUV", playable: false, alt: "Orange Thar SUV concept with chunky tyres and a black roof" },
  { id: "fortuner", name: "Fortuner", line: "Entry ho toh aisi.", type: "Large SUV", playable: false, alt: "White Fortuner SUV concept with a dark grille and windows" },
  { id: "scooty", name: "Scooty", line: "Chhoti sawaari. Full azaadi.", type: "City scooter", playable: false, alt: "Turquoise scooter concept with a black seat and curved bodywork" },
  { id: "ktm", name: "KTM", line: "Orange wala josh.", type: "Sport motorcycle", playable: false, alt: "Orange sport motorcycle concept with angular fairings and black wheels" },
  { id: "toto", name: "Toto e-rickshaw", line: "Electric sawaari. Apna saathi.", type: "Electric rickshaw", playable: false, alt: "Blue electric Toto rickshaw concept with open seating and chrome rails" },
].map((ride) => ({ ...ride, src: image(ride.id) }));

export const cities = [
  { id: "mumbai", name: "Mumbai", line: "Samundar ki hawa. Kaali-peeli ka swag.", landmark: "Marine Drive · Colaba", playable: true, alt: "Mumbai concept art showing an auto on the palm-lined Marine Drive seafront" },
  { id: "delhi", name: "Delhi", line: "Dilli Boulevard", landmark: "India Gate", playable: false, alt: "Delhi city concept showing a broad boulevard beside India Gate" },
  { id: "kolkata", name: "Kolkata", line: "Hooghly Hop", landmark: "Howrah Bridge", playable: false, alt: "Kolkata city concept with Howrah Bridge, yellow taxis and riverside traffic" },
  { id: "chennai", name: "Chennai", line: "Marina Cruise", landmark: "Marina Beach", playable: false, alt: "Chennai city concept showing a scooter on a sunny palm-lined coastal road" },
  { id: "bangalore", name: "Bangalore", line: "Garden City Run", landmark: "Green avenues", playable: false, alt: "Bangalore city concept showing a motorcycle among green avenues and flowering trees" },
].map((city) => ({ ...city, src: image(city.id) }));

export const characters = [
  { id: "sachin", name: "Sachin", role: "Your driver", alt: "Sachin's actual 3D character model in a khaki driver's uniform, holding his keys" },
  { id: "raju", name: "Raju Kaka", role: "The auto stand regular", alt: "Raju Kaka's actual 3D character model with silver hair, a khaki uniform and a shoulder towel" },
  { id: "meera", name: "Meera Tai", role: "Your chai stop", alt: "Meera Tai's actual 3D character model in a green sari with a kettle and a cup of chai" },
  { id: "sameer", name: "Sameer", role: "The neighbourhood mechanic", alt: "Sameer's actual 3D character model in blue work clothes holding a spanner" },
  { id: "aarti", name: "Aarti", role: "A familiar face", alt: "Aarti's actual 3D character model in a blue patterned kurta holding a phone" },
  { id: "imran", name: "Imran", role: "On his way through town", alt: "Imran's actual 3D character model in a maroon hoodie carrying a book" },
  { id: "lata", name: "Lata Mavshi", role: "Flowers for your day", alt: "Lata Mavshi's actual 3D character model in a purple sari carrying a basket of flowers" },
  { id: "patil", name: "Constable Patil", role: "Keeping the crossing clear", alt: "Constable Patil's actual 3D character model in a white traffic-police uniform and cap" },
].map((character) => ({ ...character, src: image(character.id) }));

const worldImages: GalleryImage[] = [
  { slug: "mumbai-street-scene", src: image("street-scene"), title: "A city with company", alt: "Rendered game assets showing Mumbai buildings, characters, an auto, taxi and red bus together at street scale", caption: "World render · Mumbai buildings, people and traffic from the game.", width: 1100, height: 649, category: "world", kind: "World render" },
  ...[
    { id: "taj", title: "Taj Mahal Palace", alt: "Original 3D game interpretation of the Taj Mahal Palace with red domes and a cream facade" },
    { id: "gateway", title: "Gateway of India", alt: "Original 3D game interpretation of the Gateway of India with its central stone arch" },
    { id: "csmt", title: "CSMT", alt: "Original 3D game interpretation of Mumbai's CSMT station with a dome and red-roofed towers" },
  ].map((landmark): GalleryImage => ({ slug: landmark.id, src: image(landmark.id), title: landmark.title, alt: landmark.alt, caption: "World render · A Mumbai landmark from the game's model library.", width: 480, height: 360, category: "world", kind: "World render" })),
];

export const galleryImages: GalleryImage[] = [
  ...gameImages.map((item): GalleryImage => ({ ...item, category: item.slug === "playable-map" ? "world" : "gameplay", kind: item.slug === "playable-map" ? "Playable map" : "Gameplay" })),
  ...cities.map((city): GalleryImage => ({ slug: `${city.id}-concept`, src: city.src, title: city.name, alt: city.alt, caption: `City concept · ${city.playable ? "Mumbai is playable; this image is concept artwork." : "Coming soon. This city is a preview, with no release date announced."}`, width: city.id === "mumbai" || city.id === "chennai" ? 498 : city.id === "kolkata" ? 501 : 502, height: 344, category: "world", kind: "Concept art" })),
  ...worldImages,
  ...rides.map((ride): GalleryImage => ({ slug: `${ride.id}-concept`, src: ride.src, title: ride.name, alt: ride.alt, caption: `Vehicle concept · ${ride.playable ? "The auto rickshaw is playable in Mumbai." : "Coming soon. This ride is still in development."}`, width: 512, height: 512, category: "rides", kind: "Concept art" })),
  ...characters.map((character): GalleryImage => ({ slug: character.id, src: character.src, title: character.name, alt: character.alt, caption: `3D character · ${character.role}. Rendered from the game's character models.`, width: 384, height: 460, category: "characters", kind: "3D character" })),
];

export const gameplayImages = galleryImages.filter((item) => item.category === "gameplay");
