// Actual captures and the road-network map from the owner's game project.
// Source files and capture provenance are recorded in development.md.
export const gameImages = [
  {
    slug: "seafront-drive",
    src: "/images/bap-ka-rasta-seafront.webp",
    title: "A drive along the seafront",
    alt: "A black-and-yellow auto rickshaw beside the sea, with pedestrians and the four-gear driving controls visible",
    caption: "Actual third-person gameplay from the early Mumbai build. The promenade, traffic and pedestrians share a stylised coastal neighbourhood.",
    width: 1280, height: 800,
  },
  {
    slug: "driver-camera",
    src: "/images/bap-ka-rasta-camera.webp",
    title: "From the driver's seat",
    alt: "The first-person camera inside the auto rickshaw, looking past its handlebars toward a Mumbai-inspired street",
    caption: "Actual browser gameplay from the driver camera. Switch between this view and the outside camera with C or the on-screen camera control.",
    width: 1440, height: 900,
  },
  {
    slug: "street-conversation",
    src: "/images/bap-ka-rasta-conversation.webp",
    title: "Voices from the neighbourhood",
    alt: "The auto rickshaw near Mumbai street characters, with a local's dialogue caption displayed during gameplay",
    caption: "A captured moment from the game's street dialogue. The neighbourhood includes local characters, vendors and conversations alongside the driving.",
    width: 1280, height: 800,
  },
  {
    slug: "playable-map",
    src: "/images/bap-ka-rasta-mumbai-map.webp",
    title: "The playable Mumbai map",
    alt: "Bap Ka Rasta's illustrated playable road map with a seafront, connected city streets and district labels",
    caption: "Generated from the game's road network and boundary data. This is a fictional, Mumbai-inspired play space, not a map for navigating the real city.",
    width: 1600, height: 1600,
  },
] as const;

export const galleryPath = "/games/bap-ka-rasta/screenshots";
