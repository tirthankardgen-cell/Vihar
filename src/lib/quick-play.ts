import type { GameCategory } from "./game-categories";

// Confirmed by the owner and /api/games on 9 November 2026. Paths below are
// explicit entries from that manifest, not slugs inferred from display names.
export const quickPlayOrigin = "https://games.vihar.online";
export const quickPlayUpdated = "2026-11-09T00:00:00+05:30";
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
  genre: "Board & Table" | "Puzzles & Quick Play";
  categories: readonly GameCategory[];
  source: "officialGames";
  collection: "quick-play";
  embedUrl: string;
  allowedOrigin: typeof quickPlayOrigin;
  artwork: string;
  artworkAlt: string;
  instructions: readonly string[];
  tip: string;
  release: QuickPlayRelease;
};

type Entry = Omit<QuickPlayGame, "source" | "collection" | "allowedOrigin" | "artwork" | "release"> & { release?: QuickPlayRelease };
const entries: readonly Entry[] = [
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
    embedUrl: "https://games.vihar.online/carrom/play",
    description: "Line up the striker. Pocket a coin. Bring everyone to the board.",
    about: "A familiar tabletop ritual, with just enough precision to make every turn interesting. Carrom is about clean angles, gentle rebounds and finding a path through a crowded board.",
    artworkAlt: "Flat illustration of a wooden carrom board with black and cream coins and a red queen",
    instructions: ["Aim the striker at a coin and send it towards a corner pocket.", "Plan your shot around the other coins and the edges of the board.", "The queen needs a cover; the game's rules explain how to secure it and handle fouls."],
    tip: "Use the cushions when a direct route to the pocket is blocked.",
  },
  {
    id: "checkers", title: "Checkers", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/checkers/play",
    description: "Take the diagonal. Spot the jump. Turn a small move into a big advantage.",
    about: "Easy to recognise and rewarding to think through. Checkers turns a board of simple pieces into a contest of timing, trades and carefully protected diagonals.",
    artworkAlt: "Flat illustration of a checkerboard with terracotta and cream draughts pieces",
    instructions: ["Move your pieces diagonally along the playable squares.", "Jump over opposing pieces to capture them, following the game's capture rules.", "Reach the far side to crown a king and aim to leave your opponent without a legal move."],
    tip: "Look for the second jump before committing to the first.",
  },
  {
    id: "chess", title: "Chess", genre: "Board & Table", categories: ["board-table"],
    embedUrl: "https://games.vihar.online/chess/play",
    description: "A quiet board. A clever plan. A new story with every move.",
    about: "Chess rewards curiosity as much as calculation. Bring your pieces into the game, keep your king safe and look for the move that changes the whole position.",
    artworkAlt: "Flat illustration of a chessboard with a cream knight and a dark king",
    instructions: ["Each kind of piece moves differently; White makes the first move.", "Develop your pieces and protect your king from check.", "Win by checkmating the opposing king: a check with no legal escape."],
    tip: "Before moving, check what your opponent is threatening.",
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
    artworkAlt: "Flat illustration of a numbered board with a green snake and golden ladders",
    instructions: ["Roll the die and move forward by the number shown.", "Land at the foot of a ladder to climb, or on a snake's head to slide.", "Reach the final square according to the game's finishing-roll rule."],
    tip: "The next roll can change everything. Enjoy the journey to the top.",
  },
  {
    id: "sudoku", title: "Sudoku", genre: "Puzzles & Quick Play", categories: ["puzzles", "solo"],
    embedUrl: "https://games.vihar.online/sudoku/play",
    description: "Nine numbers. One clear answer. Find a little order in the grid.",
    about: "A calm space for logical thinking. Sudoku needs no arithmetic: each number is a clue to what can go in the spaces around it, until the whole grid falls into place.",
    artworkAlt: "Flat illustration of a Sudoku grid with handwritten-style number clues",
    instructions: ["Fill empty squares with the numbers 1 to 9.", "Each row, column and 3 × 3 box must contain every number exactly once.", "Use the given clues to rule out possibilities without changing the starting numbers."],
    tip: "Look for a row, column or box with only a few empty squares.",
  },
  {
    id: "tic-tac-toe", title: "Tic-Tac-Toe", genre: "Puzzles & Quick Play", categories: ["puzzles"],
    embedUrl: "https://games.vihar.online/tic-tac-toe/play",
    description: "A familiar doodle. A friendly challenge. Just one more round.",
    about: "Nine squares and two marks are all it takes. Tic-Tac-Toe is a small game of noticing opportunities, blocking a line and setting up a choice your opponent cannot cover.",
    artworkAlt: "Flat notebook illustration of a Tic-Tac-Toe grid with terracotta crosses and green circles",
    instructions: ["Take turns placing an X or an O in an empty square.", "Make a line of three of your marks across, down or diagonally.", "If all nine squares fill without a line, the round is a draw."],
    tip: "Watch for forks: two possible winning lines created by one move.",
  },
];

export const quickPlayGames: QuickPlayGame[] = entries.map((entry) => ({
  ...entry,
  source: "officialGames",
  collection: "quick-play",
  allowedOrigin: quickPlayOrigin,
  artwork: `/images/quick-play/${entry.id}.png`,
  // Live manifest: all twelve are planned, with availableModes: []. Gameplay
  // is owned by the separate games project; do not enable placeholder frames.
  release: entry.release ?? { status: "upcoming" },
}));

export function getQuickPlayGame(id: string) {
  return quickPlayGames.find((game) => game.id === id);
}

export function releasedQuickPlayGames() {
  return quickPlayGames.filter((game) => game.release.status === "playable");
}
