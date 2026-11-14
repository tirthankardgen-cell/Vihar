import type { GameCategory } from "./game-categories";

// Confirmed by the owner and /api/games on 9 November 2026. Paths below are
// explicit entries from that manifest, not slugs inferred from display names.
export const quickPlayOrigin = "https://games.vihar.online";
export const quickPlayUpdated = "2026-11-14T16:10:00.000Z";
export const quickPlayModes = {
  solo: "Solo",
  computer: "Vs computer",
  practice: "Practice",
  "pass-and-play": "Pass & Play",
  online: "Online Rooms",
} as const;

export type QuickPlayMode = keyof typeof quickPlayModes;
export type QuickPlayRelease =
  | { status: "upcoming" }
  | {
      status: "playable";
      // Change a release only after checking the deployed game, bridge, SDK,
      // device support and modes. A resolving coming-soon URL is not a release.
      verifiedAt: string;
      modes: readonly QuickPlayMode[];
      devices: readonly ("Desktop" | "Tablet" | "Phone")[];
      controls: string;
    };

export type QuickPlayGame = {
  id: string;
  title: string;
  description: string;
  about: string;
  genre: "Board & Table" | "Puzzles & Quick Play" | "Arcade";
  categories: readonly GameCategory[];
  source: "officialGames";
  collection: "quick-play";
  embedUrl: string;
  allowedOrigin: typeof quickPlayOrigin;
  artwork: string;
  artworkAlt: string;
  artworkLabel: "Game illustration" | "Game screenshot";
  visual: { theme: "courtyard" | "pool" | "cloth" | "toybox" | "keepsakes" | "desktop" | "garden" | "folk" | "journal" | "notebook" | "airmail" | "silk" | "rain" | "desert" | "lantern" | "ceramic" | "optical" | "market" | "brass" | "riverstone" | "chalk" | "celestial"; name: string; description: string; hindi?: string };
  screenshot?: { src: string; alt: string; caption: string };
  instructions: readonly string[];
  faqs?: readonly { question: string; answer: string }[];
  tip: string;
  release: QuickPlayRelease;
};

type Entry = Omit<QuickPlayGame, "source" | "collection" | "allowedOrigin" | "artwork" | "artworkLabel" | "visual" | "release"> & { artwork?: string; artworkLabel?: QuickPlayGame["artworkLabel"]; release?: QuickPlayRelease };
const visuals: Record<string, QuickPlayGame["visual"]> = {
  paperwing: { theme: "airmail", name: "Airmail Atelier", description: "Letter paper, navy folds and postal coral. An original paper swallow flies through a quiet faded-blue sky." },
  "silk-trail": { theme: "silk", name: "Silk Garden", description: "A parchment silk panel, mulberry-green stitches and copper-stemmed leaves. A little garden, one turn at a time." },
  "monsoon-blocks": { theme: "rain", name: "Rain Window", description: "Flat patterned glass swatches in slate, rain blue, sea glass, plum and amber. A quiet window into a falling-block puzzle." },
  "dune-dash": { theme: "desert", name: "Desert Field Notes", description: "Sand paper, a rust fox and hand-cut sandstone silhouettes. A clear horizon from an illustrated field guide." },
  "lantern-logic": { theme: "lantern", name: "Lantern Workshop", description: "Rice paper, plum clues and flat amber squares. A hidden stencil comes into view in a quiet lantern workshop." },
  "mosaic-shift": { theme: "ceramic", name: "Ceramic Studio", description: "Cobalt borders, cream numbered tiles and original ceramic motifs. A small studio study waiting to be restored." },
  "prism-paths": { theme: "optical", name: "Optical Print Room", description: "Drafting paper, graphite mirrors and amber and blue beams. A crisp optical diagram with room to think." },
  "crate-courtyard": { theme: "market", name: "Morning Market", description: "Limestone floor joints, indigo walls and rust crates with produce stamps. An overhead delivery puzzle in the morning market." },
  "tide-turn": { theme: "brass", name: "Brass Water Study", description: "Matte brass vessels, umber outlines and crisp teal waterlines. A measuring study on warm ivory paper." },
  "pebble-solitaire": { theme: "riverstone", name: "Riverstone Tray", description: "A flat cross-shaped tray, engraved river pebbles and reed-green margins. Thirty-three holes for a patient plan." },
  "rangoli-loops": { theme: "chalk", name: "Chalk Threshold", description: "Limestone paper, aubergine clues and a crisp chalk loop. Rangoli motifs sit quietly outside the logical grid." },
  "orbit-breaker": { theme: "celestial", name: "Celestial Instrument", description: "Midnight ink, aged-gold instruments and flat celestial glyphs. A small comet crosses a quiet star chart." },
  billiards: { theme: "pool", name: "Vintage Pool Club", description: "Deep green felt, numbered balls and quiet club lettering. A clear view of every angle." },
  carrom: { theme: "courtyard", name: "The Veranda Club", hindi: "कैरम", description: "The game's evening veranda: deep teal walls, warm brass, a wooden board and the shared red queen. The click of a coin. The comfort of good company." },
  checkers: { theme: "cloth", name: "Block Print Cloth", description: "Indigo and cream squares on a block-print cloth, with terracotta counters and printed crowns." },
  chess: { theme: "courtyard", name: "Indian Courtyard", hindi: "शतरंज", description: "Cream and deep-teal squares, familiar chess silhouettes and the warmth of a neighbourhood courtyard." },
  "connect-four": { theme: "toybox", name: "Retro Toybox", description: "A muted blue frame, coral and mustard discs, and a little childhood colour on warm cream." },
  ludo: { theme: "courtyard", name: "Indian Courtyard", hindi: "लूडो", description: "A cotton-ground board with terracotta, neem, saffron and indigo tokens. Four colours, four familiar paths home." },
  "memory-match": { theme: "keepsakes", name: "Illustrated Keepsakes", description: "Mangoes, kites, chai and everyday treasures. Friendly picture cards with one shared printed back." },
  minesweeper: { theme: "desktop", name: "Retro Desktop", description: "A charcoal surround, flat grey cells and teal flags. Familiar number clues, clearly printed." },
  reversi: { theme: "garden", name: "Quiet Garden", description: "Sage squares, charcoal and ivory discs, and a small leaf at the margin. Space to think." },
  "snakes-and-ladders": { theme: "folk", name: "Folk Art Journey", description: "Warm paper, bamboo ladders and friendly folk-art snakes along the numbered journey to 100." },
  sudoku: { theme: "journal", name: "Puzzle Journal", description: "Graphite clues, blue entries and small pencil notes. A carefully ruled page for a little order." },
  "tic-tac-toe": { theme: "notebook", name: "Notebook Doodles", description: "Blue crosses, red loops and four uneven pen lines. A quiet ruled notebook, ready for another round." },
};
const entries: readonly Entry[] = [
  {
    id: "paperwing", title: "Paperwing", genre: "Arcade", categories: ["arcade", "solo"],
    embedUrl: "https://games.vihar.online/paperwing/play",
    description: "A little paper. A lot of sky. Tap your folded swallow through the airmail openings.",
    about: "Find a flying rhythm with an original paper swallow. Play opens straight into a fresh flight; click Paperwing to choose Standard or Practice. Practice offers wider openings and a gentler speed rise. Each passed gate earns one point, while moving shutters and wax-seal hazards bring new challenges as the sky gets quicker. A collision ends the flight. Personal records and paused flights save on this device when browser storage is available. No download or account is required.",
    artworkAlt: "Original folded paper swallow on a faded-blue airmail postcard with navy fold lines, coral postal edging and a gold stamp",
    instructions: ["Play starts a fresh flight immediately. Click Paperwing to choose Standard or Practice, then Start flight. Saved unfinished flights return paused.", "Tap the sky or press Space, Up or W to flap. Each new press gives one flap; holding a key does not keep flapping.", "Fly through the openings and around the wax seals. Each gate passed earns one point; hitting a panel, seal or sky boundary ends the run. Speed rises gradually, and later gates include moving shutters.", "Pause with the pause control. Resume after the three-count countdown, retry a finished run, or return to mode selection. Standard and Practice keep separate personal bests."],
    tip: "Short, deliberate taps keep your flight steadier than a burst of frantic flaps.",
    release: { status: "playable", verifiedAt: "2026-11-14T16:10:00.000Z", modes: ["solo"], devices: ["Desktop", "Tablet", "Phone"], controls: "Tap or click the sky, or press Space, Up or W to flap. Choose Standard or Practice. Pause and resume with the game controls; hidden tabs pause the flight. Exit to Vihar returns to this page. Saved flights and personal bests stay on this device when storage is available." },
  },
  {
    id: "silk-trail", title: "Silk Trail", genre: "Arcade", categories: ["arcade", "solo"],
    embedUrl: "https://games.vihar.online/silk-trail/play",
    description: "Guide a stitched garden snake. Gather leaves and leave yourself room to turn.",
    about: "A classic growing-snake challenge imagined as a woven garden panel. Plan the next turn, gather leaves and protect the space your longer trail will need. This solo game is in development.",
    artworkAlt: "Mulberry-green stitched snake and a copper leaf on a parchment grid with a woven silk border",
    instructions: ["Guide the snake through the grid to collect leaves.", "Each leaf lengthens the trail. Avoid the boundaries and your own occupied cells.", "Plan ahead as the available space becomes smaller."],
    tip: "Keep an open route around your own trail.",
  },
  {
    id: "monsoon-blocks", title: "Monsoon Blocks", genre: "Arcade", categories: ["arcade", "solo"],
    embedUrl: "https://games.vihar.online/monsoon-blocks/play",
    description: "Arrange falling glass swatches. Clear a row and make room for the next shape.",
    about: "Seven patterned falling shapes meet a flat rain-window grid. Fit and rotate the swatches to complete rows before the stack reaches the top. This solo game is in development.",
    artworkAlt: "Flat rain-window grid with blue, sea-glass, plum and amber block swatches and thin mullion lines",
    instructions: ["Move and rotate the falling shape into an open position.", "Fill an entire row to clear it and create more space.", "Use the next-shape preview and hold option to plan before the stack reaches the top."],
    tip: "A level stack leaves more options for the next shape.",
  },
  {
    id: "dune-dash", title: "Dune Dash", genre: "Arcade", categories: ["arcade", "solo"],
    embedUrl: "https://games.vihar.online/dune-dash/play",
    description: "Run the desert horizon. Help a little fox jump and duck past the next obstacle.",
    about: "An original rust-coloured fox races across a flat illustrated desert. Read the approaching sandstone and birds, then time each jump or duck. This solo game is in development.",
    artworkAlt: "Rust fox with a cream-tipped tail running past sandstone silhouettes on a flat sand-paper field-guide horizon",
    instructions: ["Watch the obstacles approaching along the horizon.", "Jump over ground obstacles and duck beneath low birds.", "A collision ends the run; aim to travel a little farther next time."],
    tip: "Watch the approach distance and keep your next action deliberate.",
  },
  {
    id: "lantern-logic", title: "Lantern Logic", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/lantern-logic/play",
    description: "Read the row and column clues. Light a hidden picture, one square at a time.",
    about: "A picture-logic puzzle on rice paper. Row and column clues describe groups of filled cells; careful deduction reveals an amber stencil. This solo game is in development.",
    artworkAlt: "Plum-lined rice-paper stencil grid with amber cells, number clues and lantern tassels outside the grid",
    instructions: ["Read each clue as a run of filled cells in that row or column.", "Keep separate runs apart with at least one empty cell.", "Mark filled and empty cells until all row and column clues agree."],
    tip: "Start with long runs that have little room to move.",
  },
  {
    id: "mosaic-shift", title: "Mosaic Shift", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/mosaic-shift/play",
    description: "Slide numbered ceramic tiles into place and restore a miniature mosaic.",
    about: "A sliding-tile puzzle from an imagined ceramic studio. Move neighbours into the empty square and restore the ordered numbered design. This solo game is in development.",
    artworkAlt: "Cream numbered ceramic tiles with cobalt borders, teal and terracotta floral motifs, and one dashed empty square",
    instructions: ["Slide a tile next to the empty square into that space.", "Keep rearranging the tiles until the numbered pattern is in order.", "Use the empty space to move groups of tiles without losing completed sections."],
    tip: "Work on one row at a time while keeping room to manoeuvre.",
  },
  {
    id: "prism-paths", title: "Prism Paths", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/prism-paths/play",
    description: "Turn mirrored tiles and guide a beam of light to every matching receiver.",
    about: "An optical puzzle drawn as a clean instrument diagram. Rotate mirrors to route labelled beams around walls and into their matching receivers. This solo game is in development.",
    artworkAlt: "Graphite optical grid on drafting paper with slash mirrors, labelled receivers and amber and dashed blue beam paths",
    instructions: ["Trace each labelled beam from its emitter.", "Turn mirrors to redirect the beam around blocked cells.", "Light every matching receiver to complete the diagram."],
    tip: "Trace backwards from a receiver to find a useful mirror position.",
  },
  {
    id: "crate-courtyard", title: "Crate Courtyard", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/crate-courtyard/play",
    description: "Push market crates onto their chalk marks. Think ahead; crates cannot be pulled.",
    about: "A top-down delivery puzzle in a quiet morning market. Guide the keeper and push crates onto their targets without trapping them in a corner. This solo game is in development.",
    artworkAlt: "Flat limestone market map with indigo walls, rust produce crates, chalk targets and a small keeper symbol",
    instructions: ["Walk the keeper through open floor cells.", "Push a crate into the empty square beyond it; crates cannot be pulled.", "Place every crate on a target to finish the delivery."],
    tip: "Keep crates away from corners unless a target is there.",
  },
  {
    id: "tide-turn", title: "Tide Turn", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/tide-turn/play",
    description: "Fill, pour and empty brass vessels until their water matches the exact target.",
    about: "A measuring puzzle using labelled brass vessels. Fill a vessel, empty it or pour until the source empties or the destination fills. Find the sequence that matches every target volume. This solo game is in development.",
    artworkAlt: "Flat outlined brass measuring vessels with litre labels, fine ticks, target notches and crisp teal waterlines on ivory paper",
    instructions: ["Read each vessel's capacity, current volume and target volume.", "Fill or empty a vessel, or pour into another until the source is empty or the destination is full.", "Match the complete set of target volumes to finish."],
    tip: "The difference between two capacities can create a useful remainder.",
  },
  {
    id: "pebble-solitaire", title: "Pebble Solitaire", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/pebble-solitaire/play",
    description: "Jump one river pebble over another. Finish with a single stone in the centre.",
    about: "English peg solitaire imagined as a flat riverstone tray. The classic cross has 33 holes and begins with only the centre empty. Each orthogonal jump removes a pebble. This solo game is in development.",
    artworkAlt: "Cross-shaped riverstone tray with 33 circular holes, dark engraved pebbles, an empty centre ring and reed strokes in the margins",
    instructions: ["Jump a pebble over an adjacent pebble into the empty hole beyond.", "Remove the jumped pebble. Moves are horizontal or vertical, never diagonal.", "Keep jumping until just one pebble remains in the centre."],
    tip: "Plan how the outer arms will feed stones back towards the centre.",
  },
  {
    id: "rangoli-loops", title: "Rangoli Loops", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/rangoli-loops/play",
    description: "Follow numbered clues and draw one unbroken loop around a rangoli grid.",
    about: "A loop-drawing logic puzzle on limestone paper. Clues count the surrounding drawn edges; the final path must form one closed loop without branches. This solo game is in development.",
    artworkAlt: "Aubergine dotted clue grid and a dark chalk loop on limestone paper with rose and saffron rangoli corner motifs",
    instructions: ["Each number tells you how many of that cell's four edges belong to the loop.", "Draw edges and cross out edges you know are unused.", "Satisfy every clue with one closed loop, without branches or crossings."],
    tip: "A zero rules out all four edges around its cell.",
  },
  {
    id: "orbit-breaker", title: "Orbit Breaker", genre: "Arcade", categories: ["arcade", "solo"],
    embedUrl: "https://games.vihar.online/orbit-breaker/play",
    description: "Keep a comet in play with your paddle and clear a field of celestial tiles.",
    about: "A brick-breaking challenge drawn as a celestial instrument. Guide an aged-gold paddle, return the comet and clear glyph tiles across the star chart. This solo game is in development.",
    artworkAlt: "Flat midnight star chart with celestial glyph panels, explicit durability pips, a slim gold paddle and a cream comet",
    instructions: ["Move the paddle to return the comet into the tile field.", "Break the tiles; durability marks show which need another hit.", "Keep the comet in play and clear the stage before running out of lives."],
    tip: "Use different paddle positions to change the comet's next angle.",
  },
  {
    id: "billiards", title: "Billiards", genre: "Board & Table", categories: ["board-table", "simulation"],
    embedUrl: "https://games.vihar.online/billiards/play",
    description: "Find the angle. Set up the next shot. Make every pocket count.",
    about: "A game of touch, angles and a little patience. Billiards brings the familiar rhythm of the pool table to Quick Play, where a careful shot can leave you perfectly placed for the next one.",
    artworkAlt: "Flat illustration of a green pool table, cue and coloured billiard balls",
    instructions: ["Use the cue ball to pocket the object balls.", "In 8-ball, clear your assigned group of solids or stripes before the 8-ball.", "Watch where the cue ball will finish, and follow the game's foul and turn rules."],
    tip: "A softer, well-placed shot can be more useful than a powerful one.",
  },
  {
    id: "carrom", title: "Carrom", genre: "Board & Table", categories: ["board-table"],
    artwork: "/images/quick-play/styles/carrom-veranda-club.webp",
    embedUrl: "https://games.vihar.online/carrom/play",
    description: "Play Carrom free in your browser. Choose a computer challenge, practise your aim or share the board with a friend.",
    about: "Pull up a chair at the Veranda Club. Choose Easy, Medium or Hard against Ravi, share a device with a friend, or find your aim in Practice. Slide the striker, pull back and release to shoot. Competitive boards use singles house rules: pocket your nine coins and cover the queen before clearing your last coin. Settled boards save on this device when storage is available; online rooms are coming soon.",
    artworkAlt: "Carrom's original wooden board, cream and dark coins, red queen and brass striker in the game's deep-teal evening Veranda Club",
    instructions: ["Slide the striker along your baseline, pull backward to aim and set power, then release to shoot. Board options also offers keyboard controls and Confirm shot.", "Pocketing an own coin in a legal shot earns another turn. An empty shot or an opponent's coin passes the turn; Pass & Play waits for the next player to accept.", "After pocketing an own coin on an earlier shot, pocket the queen with an own coin or cover it on the next legal shot. Clear your nine coins after the queen is covered to win.", "Pocketing the striker or sending a piece out of bounds is a foul: your pocketed coins return, a penalty coin or debt applies, and the turn ends. Practice has no penalties or winner."],
    tip: "Use the cushions when a direct route to the pocket is blocked.",
    faqs: [
      { question: "Can I play Carrom for free without an account?", answer: "Yes. Carrom runs free inside Vihar in your browser, with no download or account required. Guest play is available; a signed-in launch can record activity and enable player reviews." },
      { question: "Which Carrom modes are available?", answer: "Play against the computer at Easy, Medium or Hard, practise on your own, or share one device with a friend in two-player Pass & Play. Private online rooms are coming soon." },
      { question: "How do I aim and shoot on a phone or computer?", answer: "Slide the striker along your baseline, pull backward to aim and set power, then release to shoot using touch or a mouse. Board options offers keyboard controls for position, aim and power, followed by Confirm shot." },
      { question: "Does Carrom save my board?", answer: "Settled boards save on this device when browser storage is available. Return to the game and choose Resume board. Reloading during a moving shot restores the previous settled board. If storage is blocked, you can keep playing in the current tab; cross-device cloud saves are not available." },
      { question: "How do I win and cover the queen?", answer: "Competitive singles boards use Vihar's casual house rules. After pocketing an own coin on an earlier legal shot, pocket the queen with an own coin or cover it on the next legal shot. Clear your nine coins after the queen is covered to win. Practice has no penalties or winner." },
    ],
    release: {
      status: "playable", verifiedAt: "2026-11-14T08:16:00.000Z",
      modes: ["computer", "practice", "pass-and-play"], devices: ["Desktop", "Tablet", "Phone"],
      controls: "Slide the striker, pull backward to aim and add power, then release to strike with a mouse or touch. Use Board options for keyboard position, aim and power controls, then Confirm shot. Choose a computer level, Practice or Pass & Play; pause, resume and return to Vihar at any time. Only settled boards save on this device.",
    },
  },
  {
    id: "checkers", title: "Checkers", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/checkers/play",
    description: "Take the diagonal. Spot the jump. Turn a small move into a big advantage.",
    about: "Easy to recognise and rewarding to think through. Checkers turns a board of simple pieces into a contest of timing, trades and carefully protected diagonals.",
    artworkAlt: "Indigo and cream eight-by-eight checkerboard with terracotta and ivory counters and a block-print cloth border",
    instructions: ["Move your pieces diagonally along the playable squares.", "Jump over opposing pieces to capture them, following the game's capture rules.", "Reach the far side to crown a king and aim to leave your opponent without a legal move."],
    tip: "Look for the second jump before committing to the first.",
  },
  {
    id: "chess", title: "Chess", genre: "Board & Table", categories: ["board-table"],
    artwork: "/images/quick-play/styles/chess-neem-courtyard.webp",
    embedUrl: "https://games.vihar.online/chess/play",
    description: "A quiet board. A clever plan. A new story with every move.",
    about: "Pull up a chair in a quiet Indian courtyard. Play Easy, Medium or Hard against Acharya Dev, your chess mentor, or share a device with a friend. Develop your pieces, protect your king and find the move that changes the whole position. Games are untimed and can be saved on this device.",
    artworkAlt: "Flat cream and deep-teal eight-by-eight chessboard in a terracotta courtyard with neem leaves, teal shutters and a woven charpoy",
    screenshot: { src: "/images/quick-play/chess-gameplay.webp", alt: "The playable Chess board with cream and dark pieces and Acharya Dev", caption: "The playable Chess board and Acharya Dev, your computer opponent." },
    instructions: ["Each kind of piece moves differently; White makes the first move.", "Develop your pieces and protect your king from check.", "Win by checkmating the opposing king: a check with no legal escape."],
    tip: "Before moving, check what your opponent is threatening.",
    release: {
      status: "playable", verifiedAt: "2026-11-09T16:02:02.362Z",
      modes: ["computer", "pass-and-play"], devices: ["Desktop", "Tablet", "Phone"],
      controls: "Tap or click a piece, then a marked legal destination. Use arrow keys and Enter on the board. Choose a computer level or Pass & Play; games are untimed. Pause, resume or save and leave at any time.",
    },
  },
  {
    id: "connect-four", title: "Connect Four", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/connect-four/play",
    description: "Drop a disc. Build a line. Keep one eye on the next move.",
    about: "A small board with plenty of room for a surprise. Connect Four is a race to build your own line while noticing the one your opponent is quietly setting up.",
    artworkAlt: "Flat illustration of a Connect Four grid with gold and terracotta discs",
    instructions: ["Take turns dropping a disc into an open column.", "Discs fall to the lowest empty space in that column.", "Connect four of your discs horizontally, vertically or diagonally to win."],
    tip: "The centre columns give you more directions to build a line.",
  },
  {
    id: "ludo", title: "Ludo", genre: "Board & Table", categories: ["board-table"],
    artwork: "/images/quick-play/styles/ludo-family-courtyard.webp",
    embedUrl: "https://games.vihar.online/ludo/play",
    description: "Roll, race and find your way home. Every token has a chance.",
    about: "A family favourite full of small decisions and sudden changes of fortune. Ludo mixes the luck of the die with choosing which token to move, protect or send into the chase.",
    artworkAlt: "Flat illustration of a four-colour Ludo board with tokens and a die",
    instructions: ["Bring your tokens out of the yard according to the game's opening-roll rule.", "Move around the track and watch for captures and safe squares.", "Guide all four of your tokens into the home lane to finish."],
    tip: "Keeping more than one token moving gives you options on your next roll.",
  },
  {
    id: "memory-match", title: "Memory Match", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/memory-match/play",
    description: "Turn two cards. Find a pair. See what a little attention can do.",
    about: "A gentle test of observation that grows more satisfying with each remembered pair. Memory Match invites you to slow down, notice the patterns and put a scattered board back together.",
    artworkAlt: "Flat illustration of patterned cards with matching sun and leaf symbols",
    instructions: ["Turn over two cards to reveal their pictures.", "Matching pictures stay revealed; remember the positions of cards that do not match.", "Keep finding pairs until the board is clear."],
    tip: "Give each picture a name to make its position easier to remember.",
  },
  {
    id: "minesweeper", title: "Minesweeper", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/minesweeper/play",
    description: "Read the numbers. Follow the clues. Uncover a safe way through.",
    about: "A puzzle of deduction, one square at a time. Minesweeper asks you to connect the clues around each hidden space and decide what you know before taking another step.",
    artworkAlt: "Flat illustration of Minesweeper squares with number clues and small flags",
    instructions: ["Reveal squares to discover number clues.", "Each number counts the mines in the eight surrounding squares.", "Mark suspected mines and reveal every safe square to finish."],
    tip: "A flag records your guess; it does not confirm that a mine is there.",
  },
  {
    id: "reversi", title: "Reversi", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/reversi/play",
    description: "Frame a line. Flip the discs. Change the shape of the game.",
    about: "Every move can turn the board around. Reversi is a contest of position and patience, where having the most discs early is not always the strongest place to be.",
    artworkAlt: "Flat illustration of a green Reversi board with black and cream discs",
    instructions: ["Place a disc so that a line of opposing discs sits between it and one of your own.", "Flip all enclosed opposing discs along valid lines.", "When neither player can move, the player with more discs wins."],
    tip: "Corners cannot be flipped. Think carefully before giving one away.",
  },
  {
    id: "snakes-and-ladders", title: "Snakes and Ladders", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/snakes-and-ladders/play",
    description: "A lucky climb. An unexpected slide. Keep rolling towards 100.",
    about: "A cheerful race where nobody stays ahead for long. Snakes and Ladders makes room for lucky rolls, dramatic tumbles and the pleasure of seeing what happens next.",
    artworkAlt: "Folk-art board numbered one to one hundred, with patterned snakes and bamboo ladders on warm paper",
    instructions: ["Roll the die and move forward by the number shown.", "Land at the foot of a ladder to climb, or on a snake's head to slide.", "Reach the final square according to the game's finishing-roll rule."],
    tip: "The next roll can change everything. Enjoy the journey to the top.",
  },
  {
    id: "sudoku", title: "Sudoku", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/sudoku/play",
    description: "Nine numbers. One clear answer. Find a little order in the grid.",
    about: "A calm space for logical thinking. Sudoku needs no arithmetic: each number is a clue to what can go in the spaces around it, until the whole grid falls into place.",
    artworkAlt: "Crisp nine-by-nine Sudoku journal grid with graphite clues, a blue entry and small grey pencil notes",
    instructions: ["Fill empty squares with the numbers 1 to 9.", "Each row, column and 3 × 3 box must contain every number exactly once.", "Use the given clues to rule out possibilities without changing the starting numbers."],
    tip: "Look for a row, column or box with only a few empty squares.",
  },
  {
    id: "tic-tac-toe", title: "Tic-Tac-Toe", genre: "Puzzles & Quick Play", categories: ["puzzles"],
    embedUrl: "https://games.vihar.online/tic-tac-toe/play",
    description: "A familiar doodle. A friendly challenge. Just one more round.",
    about: "A ruled notebook, nine squares and two familiar marks. Play an Easy, Medium or Hard computer, or pass the notebook to a friend on the same device. Choose your marks, block a line and try another round. The notebook keeps your session score and saves your last page on this device when browser storage is available.",
    artworkAlt: "Hand-drawn blue crosses and red circles on a lightly ruled cream notebook page",
    screenshot: { src: "/images/quick-play/tic-tac-toe-gameplay.webp", alt: "The playable Tic-Tac-Toe notebook with a blue cross and red circle", caption: "The playable notebook, with blue X and red O ink." },
    instructions: ["Take turns placing an X or an O in an empty square.", "Make a line of three of your marks across, down or diagonally.", "If all nine squares fill without a line, the round is a draw."],
    tip: "Watch for forks: two possible winning lines created by one move.",
    release: {
      status: "playable", verifiedAt: "2026-11-09T16:02:02.362Z",
      modes: ["computer", "pass-and-play"], devices: ["Desktop", "Tablet", "Phone"],
      controls: "Tap or click an empty square. Use arrow keys and Enter or Space on the board. Choose Easy, Medium or Hard computer play, or Pass & Play; accept the handover between turns. Pause and resume from the game menu.",
    },
  },
];

export const quickPlayGames: QuickPlayGame[] = entries.map<QuickPlayGame>((entry) => ({
  ...entry,
  source: "officialGames",
  collection: "quick-play",
  allowedOrigin: quickPlayOrigin,
  artwork: entry.artwork ?? `/images/quick-play/styles/${entry.id}.webp`,
  artworkLabel: entry.artworkLabel ?? "Game illustration",
  visual: visuals[entry.id],
  // Enable only individually verified releases from the separate games host.
  release: entry.release ?? { status: "upcoming" },
})).sort((a, b) => Number(b.release.status === "playable") - Number(a.release.status === "playable"));

export function getQuickPlayGame(id: string) {
  return quickPlayGames.find((game) => game.id === id);
}

export function releasedQuickPlayGames() {
  return quickPlayGames.filter((game) => game.release.status === "playable");
}
