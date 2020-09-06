import { Tile, TileType, PipesTile } from '../tile/tile.component';
import { deepCopy } from '../utils';

const FULL_BOARD_WIDTH = 1000;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 5;

const DX: number[] = [-1, 0, 1, 0];
const DY: number[] = [0, -1, 0, 1];

interface Pos {
  x: number,
  y: number
};

class Stack {
  private stack: Array<Pos> = [];
  private history: Array<number> = [];

  push(pos: Pos) {
    // TODO: reconsider deep copy
    this.stack.push(deepCopy(pos));
    this.history.push(1);
  }

  pushExtra(pos: Pos) {
    this.stack.push(deepCopy(pos));
    this.history[this.history.length - 1]++;
  }

  pop() {
    const count = this.history[this.history.length - 1];
    for (let i = 0; i < count; ++i) {
      this.stack.pop();
    }
    this.history.pop();
  }

  top(topIndex: number = 0): Pos {
    return this.stack[this.stack.length - 1 - topIndex];
  }

  contains(x: number, y: number): boolean {
    // todo: better impl
    for (let i = Math.max(0, this.stack.length - 50); i < this.stack.length; ++i) {
      if (this.stack[i].x === x && this.stack[i].y === y)
        return true;
    }
    return false;
  }
}

export class Board {
  private tiles: Array<Array<Tile | undefined>> = [];
  private stack: Stack = new Stack();

  /// engine playing...
  private shouldPlayEngine_: boolean = false;
  get shouldPlayEngine() {
    const value = this.shouldPlayEngine_;
    this.shouldPlayEngine_ = false;
    return value;
  }

  constructor() {
    for (let i = 0; i < FULL_BOARD_WIDTH; ++i) {
      this.tiles.push(new Array(BOARD_HEIGHT));
      for (let j = 0; j < BOARD_HEIGHT; ++j) {
        this.tiles[i][j] = undefined;
      }
    }
    this.stack.push({x: 0, y: 2});
  }

  get(x: number, y: number): Tile | undefined {
    if (!positionOk(x, y)) return undefined;
    return this.tiles[x][y];
  }

  canPlaceTile(tile: Tile, x: number, y: number): boolean {
    if (this.get(x, y) !== undefined) return false;
    if (tile.type !== TileType.PIPES) return false;
    if (isPlusTile(tile) && x % 9 === 0) return false;
    const stackTop = this.stack.top();
    if (!canContinuePath(stackTop, {x, y})) return false;
    if (!this.pipesEndsMatch(tile, x, y)) return false;
    const toStackSide = getDirection({x, y}, stackTop);
    if (tile.layout[toStackSide] === 0) return false;  // moram nastavljati stack
    const stackTile = this.get(stackTop.x, stackTop.y);
    if (isPlusTile(stackTile) &&
        !this.isPlusOnPath(stackTop.x, stackTop.y, toStackSide)) {
      return false;
    }
    return true;
  }

  placeTile(tile: Tile, x: number, y: number): boolean {
    if (this.get(x, y) !== undefined) return false;
    this.tiles[x][y] = deepCopy(tile);
    // if placed by user, update stack
    if (tile.type === TileType.PIPES) {
      const dir = calcTileDir(this.stack.top(), {x, y}, tile);
      this.stack.push({x, y});
      this.trackPath(x, y, dir);
    }
    this.updateHelpers(this.tiles[x][y], x, y);
    return true;
  }

  removeTile(x: number, y: number) {
    if (this.get(x, y) === undefined) return;
    this.tiles[x][y] = undefined;
    this.stack.pop();
    this.updateHelpers(this.tiles[x][y], x, y);
  }

  getTiles(fromX: number, toX: number): Array<{tile: Tile, x: number, y: number}> {
    const tiles = [];
    for (let i = fromX; i < toX; ++i) {
      for (let j = 0; j < BOARD_HEIGHT; ++j) {
        const tile = this.get(i, j);
        if (tile === undefined) continue;
        tiles.push({tile, x: i, y: j});
      }
    }
    console.log(tiles);
    return tiles;
  }

  getSteam(fromX: number, toX: number): Array<{x: number, y: number, side: number}> {
    const steam = [];
    for (let x = fromX; x < toX; ++x) {
      for (let y = 0; y < BOARD_HEIGHT; ++y) {
        const tile = this.get(x, y);
        if (tile === undefined || tile.type !== TileType.PIPES) continue;
        for (let side = 0; side < 4; ++side) {
          const otherTile = this.get(x + DX[side], y + DY[side]);
          if (otherTile !== undefined) continue;
          if (tile.layout[side] === 0) continue;
          // TODO: check plus tiles better (isOnStack method)
          if (isPlusTile(tile) && !this.isPlusOnPath(x, y, side)) continue;
          steam.push({x, y, side});
        }
      }
    }
    return steam;
  }

  isConnected(x1: number, y1: number, x2: number, y2: number): boolean {
    return this.isOnStack(x1, y1) && this.isOnStack(x2, y2);
  }



  ///  the current tile is a pipe
  private pipesEndsMatch(tile: PipesTile, x: number, y: number): boolean {
    for (let side = 0; side < 4; ++side) {
      const otherTile = this.get(x + DX[side], y + DY[side]);
      const otherSide = (side + 2) % 4;
      if (otherTile === undefined) continue;
      if (otherTile.type === TileType.BLOCKED && tile.layout[side] > 0) {
        return false;
      }
      if (otherTile.type === TileType.PIPES && tile.layout[side] === 0 &&
          otherTile.layout[otherSide] > 0) {
        return false;
      }
      if (otherTile.type === TileType.PIPES && tile.layout[side] > 0 &&
          otherTile.layout[otherSide] === 0) {
        return false;
      }
    }
    return true;
  }

  // za plus tile, nalazi li se dio na pathu?
  private isPlusOnPath(x: number, y: number, side: number): boolean {
    const onStack1 = this.isOnStack(x + DX[side], y + DY[side]);
    const onStack2 = this.isOnStack(x - DX[side], y - DY[side]);
    return onStack1 || onStack2;

  }

  private isOnStack(x: number, y: number): boolean {
    return this.get(x, y) !== undefined  && this.stack.contains(x, y);
  }

  private trackPath(x: number, y: number, dir: number) {
    console.log(x, y, dir);
    x += DX[dir];
    y += DY[dir];
    const tile = this.get(x, y);
    if (tile === undefined) return;
    if (tile.type === TileType.GRATE_MACHINE) {
      const maybePlus = this.findTrackPlus(x, y);
      this.stack.pushExtra({x, y});
      this.updateHelpers(tile, x, y);
      this.shouldPlayEngine_ = true;
      if (maybePlus !== undefined) {
        this.trackPath(maybePlus.x, maybePlus.y, maybePlus.side);
      }
      return;
    }
    if (tile.type === TileType.STEAM_ENGINE) {
      this.stack.pushExtra({x, y});
      return;
    }
    if (tile.type === TileType.PIPES && isPlusTile(tile)) {
      this.stack.pushExtra({x, y});
      this.trackPath(x, y, dir);
      return;
    }
  }

  private updateHelpers(tile: Tile, x: number, y: number) {
    for (let side = 0; side < 4; ++side) {
      const otherTile = this.get(x + DX[side], y + DY[side]);
      const otherSide = (side + 2) % 4;
      if (this.isOnStack(x, y)) {
        updateHelper(tile, otherTile, side, otherSide);
      }
      if (this.isOnStack(x + DX[side], y + DY[side])) {
        updateHelper(otherTile, tile, otherSide, side);
      }
    }
  }

  private findTrackPlus(x: number, y: number): {x: number, y: number, side: number}|undefined {
    const tile = this.get(x, y);
    if (tile === undefined) return undefined;
    if (this.isOnStack(x, y)) return undefined;  /// JAO JAO JAo
    if (tile.type !== TileType.GRATE_MACHINE && tile.type !== TileType.STEAM_ENGINE) return undefined;
    for (let side = 0; side < 4; ++side) {
      const nx = x + DX[side];
      const ny = y + DY[side];
      const otherTile = this.get(nx, ny);
      if (!isPlusTile(otherTile)) continue;
      if (this.isPlusOnPath(nx, ny, side)) continue;
      return {x: nx, y: nx, side};
    }
    return undefined;
  }
}


function positionOk(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < FULL_BOARD_WIDTH && y < BOARD_HEIGHT;
}

function isPlusTile(tile: Tile): boolean {
  if (tile === undefined) return false;
  if (tile.type !== TileType.PIPES) return false;
  return tile.layout[0] + tile.layout[1] + tile.layout[2] + tile.layout[3] === 4;
}

function canContinuePath(posFrom: Pos, posTo: Pos): boolean {
  return Math.abs(posFrom.x - posTo.x) + Math.abs(posFrom.y - posTo.y) === 1;
}

function getDirection(posFrom: Pos, posTo: Pos): number {
  if (posFrom.x - 1 === posTo.x) return 0;
  if (posFrom.x + 1 === posTo.x) return 2;
  if (posFrom.y - 1 === posTo.y) return 1;
  if (posFrom.y + 1 === posTo.y) return 3;
  console.log('[board] getDirection: should NOT reach!');
  return -1;
}

function calcTileDir(posFrom: Pos, posTo: Pos, tile: Tile): number | undefined {
  if (tile.type !== TileType.PIPES) return undefined;
  // prvo probaj ravne
  const dirFrom = getDirection(posFrom, posTo);
  if (tile.layout[dirFrom] > 0) return dirFrom;
  // onda probaj zakrivljene
  for (let i = 0; i < 4; ++i) {
    if (i != (dirFrom + 2) % 4 && tile.layout[i] > 0) {
      return i;
    }
  }
  console.log('should nor REACH calcTileDir');
  return undefined;
}

function hasHelpers(tile: Tile): boolean {
  if (tile === undefined) return false;
  return tile.type === TileType.GRATE_MACHINE || tile.type === TileType.STEAM_ENGINE;
}

function updateHelper(tile1, tile2, side1, side2) {
  if (!hasHelpers(tile1)) return;
  if (tile1.helpers === undefined) tile1.helpers = [0, 0, 0, 0];
  if (tile2 === undefined || tile2.type !== TileType.PIPES) {
    tile1.helpers[side1] = 0;
    return
  }
  if (tile2.layout[side2] === 0) {
    tile1.helpers[side1] = 0;
    return;
  }
  tile1.helpers[side1] = 1;
}