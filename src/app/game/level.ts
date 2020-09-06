import { Board } from '../board/board';

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


export interface GameContext {
  gratesTotal: number;  // koliko sam generirao ukupno
  gratesRound: number;  // koliko sam generirao u ovoj rundi
  fromX: number;
  toX: number;
  board: Board;
  level: Level;
}

const MIDDLE_HEIGHT = 2;

const defaultComplete =
    (context: GameContext) => {
  if (!context.board.isOnStack(context.toX, MIDDLE_HEIGHT)) return false;
  if (context.level.grateMachines !== undefined) {
    for (const machine of context.level.grateMachines) {
      if (!context.board.isOnStack(machine.x, machine.y))
        return false;
    }
  }
  return true;
};


export const LEVELS: Level[] = [
  // level 1
  {
    startingBonus: { straightPipes: 8 },
    messages: [
      "Hi there! We're about to make a very great grate machine!",
      "But first, we'll start with some infrastructure. I acquired 8 straight pipes - use them to make a connection between two steam machines!"
    ],
    completed: defaultComplete
  },
  // level 2
  {
    startingBonus: { straightPipes: 6, turnPipes: 4 },
    messages: [
      "Well done!",
      "We'll continue with the infrastructure. I couldn't find that much straight pipes this time, but I hope you can get use of these turn pipes as well!"
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
  },
  // level 4
  {
    startingBonus: { straightPipes: 8, turnPipes: 3 },
    grateMachines: [ {x: 6, y: 0} ],
    messages: [
      "OK, I've spent all of the money on pipes!",
      "It's time to produce some grates! Connect the grate machine to both steam engine parts!"
    ],
    completed: defaultComplete
  },
  // level 5
  {
    startingBonus: { straightPipes: 7, turnPipes: 3 },
    messages: [
      "You can also connect multiple grate machines with each other so you gain more points.",
      "Try it out!"
    ],
    blockedFields: [
      '0000000000',
      '0000000000',
      '0000000000',
      '0000000000',
      '0000000000'
    ],
    grateMachines: [ { x: 3, y: 1 }, { x: 6, y: 3} ],
    completed: defaultComplete
  },
  // level 6
  {
    startingBonus: { straightPipes: 6, turnPipes: 6 },
    messages: [],
    blockedFields: [
      '0000000100',
      '0010000000',
      '0001000000',
      '0000010001',
      '0000000000'
    ],
    grateMachines: [ { x: 3, y: 1 }, { x: 6, y: 3} ],
    completed: defaultComplete
  },  
  // level 7
  {
    startingBonus: { straightPipes: 9, turnPipes: 6 },
    messages: [
      "OK, I think you've gotten the hang of it. I am leaving you in charge of connecting these grate machines.",
      "Try to connect all of them to make a very great grate machine.",
      "Good luck!"
    ],
    blockedFields: [
      '0010000000',
      '0000000000',
      '0000100000',
      '0001000000',
      '0000000000'
    ],
    grateMachines: [ { x: 1, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 2 } ],
    completed: defaultComplete
  },
   // level 8
   {
    startingBonus: { straightPipes: 10, turnPipes: 7 },
    messages: [],
    blockedFields: [
      '1000100000',
      '0000000000',
      '0001100000',
      '0000001000',
      '0000000010'
    ],
    grateMachines: [ { x: 1, y: 0 }, { x: 7, y: 4 }, { x: 6, y: 2 } ],
    completed: defaultComplete
  },
  // level 9
  {
    startingBonus: { straightPipes: 14, plusPipes: 1, turnPipes: 2 },
    messages: [
      "Our supplier has given us a new kind of pipes! A plus pipe!",
      "These pipes can be used to achieve all kinds of new connections!",
      "I assume that you can figure it out since you've gotten this far!"

    ],
    grateMachines: [ { x: 3, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 4 } ],
    completed: defaultComplete
  },
  // level 10
  { 
    startingBonus: { straightPipes: 7, turnPipes: 7 },
    messages: [
      "You are really good at connecting these pipes!",
      "Can you figure this one out?"
    ],
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
  // level 11
  {
    startingBonus: { straightPipes: 17, turnPipes: 4, plusPipes: 2 },
    messages: [
      "Here is something a little more challenging for you!"
    ],
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
  // level 12
  {
    startingBonus: { straightPipes: 12, turnPipes: 5, plusPipes: 1 },
    messages: [
      "Damn!",
      "You have almost completed our very great grate machine!",
      "Keep up the good work!"
    ],
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
   // level 13
   {
    startingBonus: { straightPipes: 10, turnPipes: 4, plusPipes: 1 },
    messages: [],
    blockedFields: [
      '0000000000',
      '0000010000',
      '0000000000',
      '0011100000',
      '0000000000'
    ],
    grateMachines: [ { x: 1, y: 0 }, { x: 5, y: 4 } ],
    completed: defaultComplete
  },
  // game completed
   {
    startingBonus: { },
    messages: [
      "Seems like you have completed all of the levels!",
      "Props to you for completing the game, you did really well!!"
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