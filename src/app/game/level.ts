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
  // list of grates machines
  grateMachines?: Array<{x: number, y: number}>;
}

const MIDDLE_HEIGHT = 2;

const defaultComplete =
    (context: GameContext) => context.board.isConnected(context.toX, MIDDLE_HEIGHT, context.fromX, MIDDLE_HEIGHT);


export const LEVELS: Level[] = [
  // jos jedan + loop varijanta(treba popraviti broj straight pipeova, al ima bug tu)
  {
    startingBonus: { straightPipes: 12, turnPipes: 5, plusPipes: 1 },
    messages: [],
    blockedFields: [
      '0000000000',
      '0000010000',
      '0000000000',
      '0000010000',
      '0000000000'
    ],
    grateMachines: [ { x: 5, y: 0 }, { x: 5, y: 4 }, { x: 3, y: 3 } ],
    completed: defaultComplete
  },
  // ovaj bi se mogel nazvat difficult, al nisam provjeril jer ne radi algoritam :/
  {
    startingBonus: { straightPipes: 7, turnPipes: 7, plusPipes: 0 },
    messages: [],
    blockedFields: [
      '0000001000',
      '0000000000',
      '0001001000',
      '0000000000',
      '0000000100'
    ],
    grateMachines: [ { x: 2, y: 1 } ,{ x: 6, y: 1 }, { x: 4, y: 2 }, { x: 6, y: 3} ],
    completed: defaultComplete
  },
   // ovo je jedan laksi s plus pipeovima (isto trenutno ne radi zbog algoritma)
   {
    startingBonus: { straightPipes: 6, turnPipes: 0, plusPipes: 2 },
    messages: [],
    blockedFields: [
      '0000000000',
      '0000000000',
      '0000000000',
      '0000000000',
      '0000000000'
    ],
    grateMachines: [ { x: 3, y: 1 } ,{ x: 6, y: 1 }, { x: 3, y: 3 }, { x: 6, y: 3} ],
    completed: defaultComplete
  },
  // jos jedan actually good level na slicnu nisu (ovaj trenutno ne radi zbog trenutnog algoritma u board.ts)
  {
    startingBonus: { straightPipes: 17, turnPipes: 4, plusPipes: 2 },
    messages: [],
    blockedFields: [
      '0000000000',
      '0000000000',
      '0000000010',
      '0000001000',
      '0000001000'
    ],
    grateMachines: [ { x: 1, y: 0 }, { x: 5, y: 4 }, { x: 6, y: 2} ],
    completed: defaultComplete
  },
   // jedan actually good level
   {
    startingBonus: { straightPipes: 10, turnPipes: 4, plusPipes: 1 },
    messages: [],
    blockedFields: [
      '0000000000',
      '0000000000',
      '0000000000',
      '0011100000',
      '0000000000'
    ],
    grateMachines: [ { x: 1, y: 0 }, { x: 5, y: 4 } ],
    completed: defaultComplete
  },

  // + loop level
  {
    startingBonus: { straightPipes: 14, turnPipes: 2, plusPipes: 1 },
    messages: [],
    grateMachines: [ { x: 3, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 4 } ],
    completed: defaultComplete
  },
  // level 1
  {
    startingBonus: { straightPipes: 8, turnPipes: 8, plusPipes: 8 },
    messages: [
      "Hi there! We're about to make a very great grate machine!",
      "But first, we'll start with some infrastructure. I acquired 8 straight pipes - use them to make a connection between two parts of steam engine!"
    ],
    completed: defaultComplete
  },
  // level 2
  {
    startingBonus: { straightPipes: 6, turnPipes: 4, plusPipes: 0 },
    messages: [
      "Well done!",
      "We'll continue with the infrastructure. I couldn't find much straight pipes this time, but I hope you can get use of these turn pipes as well!"
    ],
    completed: defaultComplete
  },
  // level 3
  {
    startingBonus: { straightPipes: 0, turnPipes: 16, plusPipes: 0 },
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
  },
  // level 4
  {
    startingBonus: { straightPipes: 8, turnPipes: 3, plusPipes: 0 },
    grateMachines: [ {x: 6, y: 0} ],
    messages: [
      "OK, if I've spent all money on the pipes!",
      "It's time to produce some grates finally! Connect the grate machine to both steam engine parts!"
    ],
    completed: defaultComplete
  },
  // game completed
  {
    startingBonus: { straightPipes: 0, turnPipes: 0, plusPipes: 0 },
    messages: [
      "Seems like you have completed all of the levels!",
      "Thank you for playing the game."
    ],
    blockedFields: [
      '1111111111',
      '1111111111',
      '1111111111',
      '1111111111',
      '1111111111'
    ],
    completed: defaultComplete
  },
];
