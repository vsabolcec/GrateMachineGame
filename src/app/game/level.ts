import { Board } from '../board/board';

export interface GameContext {
  gratesTotal: number;  // koliko sam generirao ukupno
  gratesRound: number;  // koliko sam generirao u ovoj rundi
  fromX: number;
  toX: number;
  board: Board;
}

export enum InventoryTileType {
  STRAIGHT_PIPE = 'STRAIGHT_PIPE',
  TURN_PIPE = 'TURN_PIPE',
  PLUS_PIPES = 'PLUS_PIPES'
}

export interface InventoryTiles {
  straightPipes?: number;  // counts
  turnPipes?: number;
  plusPipes?: number;
}

export interface Level {
  // lista tile-ova koje dobim
  startingBonus: InventoryTiles;
  // poruke koje se prikazuju na pocetku levela
  messages: string[];
  // callback koji kaze kad si spreman za sljedeci level
  completed: (context: GameContext) => boolean;
  // some fields may be blocked...
  blockedFields?: string[];
}

const MIDDLE_HEIGHT = 2;

const defaultComplete =
    (context: GameContext) => context.board.countConnections(context.toX, MIDDLE_HEIGHT) > 0; 

export const LEVELS: Level[] = [
  // level 1
  {
    startingBonus: { straightPipes: 8 },
    messages: [
      "Hi there! We're about to make a very great grate machine!",
      "But first, we'll start with some infrastructure. I acquired 8 straight pipes - use them to make a connection between two parts of steam engine!"
    ],
    completed: defaultComplete
  },
  // level 2
  {
    startingBonus: { straightPipes: 6, turnPipes: 4 },
    messages: [
      "Well done!",
      "We'll continue with the infrastructure. I couldn't find much straight pipes this time, but I hope you can get use of these turn pipes as well!"
    ],
    completed: defaultComplete
  },
  // level 3
  {
    startingBonus: { turnPipes: 16 },
    blockedFields: [
      '0000000000',
      '0000000010',
      '0010000000',
      '0001100000',
      '0000100000'
    ],
    messages: [
      "Damn it! There were no more straight pipes to acquire.",
      "Ooh, and some rats made damage on certain cells."
    ],
    completed: defaultComplete
  }
];
