import { Tile, TileType } from '../tile/tile.component';
import { deepCopy } from '../utils';
import { Graph } from './graph';

export class Board {
  private tiles: Array<Array<Tile | undefined>> = [];
  private modifiers: Array<Array<number>> = [];
  private graph: Graph = new Graph();

  /// engine playing...
  private shouldPlayEngine_: boolean = false;
  get shouldPlayEngine() {
    const value = this.shouldPlayEngine_;
    this.shouldPlayEngine_ = false;
    return value;
  }

  constructor(public width: number, public height: number) {
    for (let i = 0; i < 100 * width; ++i) {
      this.tiles.push(new Array(height));
      this.modifiers.push(new Array(height));
      for (let j = 0; j < height; ++j) {
        this.tiles[i][j] = undefined;
        this.modifiers[i][j] = 0;
      }
    }
  }

  placeTile(tile: Tile, x: number, y: number): boolean {
    if (this.tiles[x][y] !== undefined) return false;
    // place tile
    this.tiles[x][y] = deepCopy(tile);
    // update connectivity
    this.updateConnectivity(tile, x, y);
    // update helpers (e.g. for steam engine and grate machine)
    this.updateHelpers(this.tiles[x][y], x, y);
    return true;
  }

  removeTile(x: number, y: number): void {
    if (this.tiles[x][y] == undefined) return;
    // place tile
    this.tiles[x][y] = undefined;
    // update connectivity
    //this.updateConnectivity(tile, x, y);
    // update helpers
    this.updateHelpers(this.tiles[x][y], x, y);
  }

  canPlaceTile(tile: Tile, x: number, y: number): boolean {
    if (this.tiles === undefined || this.tiles[x] === undefined)
      return false;
    if (this.tiles[x][y] !== undefined) return false;
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const side = [2, 3, 0, 1];
    // prvo ako bas stvarno ne mozemo nesto
    for (let i = 0; i < 4; ++i) {
      const otherTile = this.get(x + dx[i], y + dy[i]);
      const otherSide = (side[i] + 2) % 4;
      if (otherTile === undefined) continue;
      if (tile.type === TileType.PIPES && tile.layout[side[i]] > 0 &&
          otherTile.type === TileType.BLOCKED) {
        return false;
      }
    }

    // onda ako bi mogli nesto...
    for (let i = 0; i < 4; ++i) {
      const otherTile = this.get(x + dx[i], y + dy[i]);
      const otherSide = (side[i] + 2) % 4;
      if (otherTile === undefined) continue;
      if (hasPipe(tile, side[i]) && hasPipe(otherTile, otherSide)) {
        return true;
      }
    }
    return false;
  }

  get(x: number, y: number): Tile | undefined {
    if (this.tiles === undefined || this.tiles[x] === undefined) {
      return undefined;
    }
    return this.tiles[x][y];
  }

  getTiles(fromX: number, toX: number): Array<{tile: Tile, x: number, y: number}> {
    const tiles = [];
    for (let i = fromX; i < toX; ++i) {
      for (let j = 0; j < this.height; ++j) {
        const tile = this.get(i, j);
        if (tile === undefined) continue;
        tiles.push({tile, x: i, y: j});
      }
    }
    return tiles;
  }

  countConnections(x: number, y: number): number {
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const side = [2, 3, 0, 1];
    const tile = this.get(x, y);
    if (tile === undefined) return 0;
    let count: number = 0;
    for (let i = 0; i < 4; ++i) {
      const otherTile = this.get(x + dx[i], y + dy[i]);
      if (otherTile === undefined) continue;
      if (hasPipe(tile, side[i]) && hasPipe(otherTile, (side[i] + 2) % 4)) {
        count++;
      }
    }
    return count;
  }

  private updateConnectivity(tile: Tile, x: number, y: number) {
    if (tile.type === TileType.PIPES) {
      if (tile.layout[0] === 1 && tile.layout[2] === 1) {
        this.graph.join({x, y, side: 0}, {x, y, side: 2});
      }
      if (tile.layout[1] === 1 && tile.layout[3] === 1) {
        this.graph.join({x, y, side: 1}, {x, y, side: 3});
      }
    }
  }

  private updateHelpers(tile: Tile, x: number, y: number) {
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const side = [2, 3, 0, 1];
    for (let i = 0; i < 4; ++i) {
      const otherTile = this.get(x + dx[i], y + dy[i]);
      const otherSide = (side[i] + 2) % 4;
      const before = checkMachineTile(otherTile);
      checkHelpers(tile, otherTile, side[i], otherSide);
      checkHelpers(otherTile, tile, otherSide, side[i]);
      const after = checkMachineTile(otherTile);
      if (after !== undefined && before !== undefined && before === 0 && after > 0) {
        this.shouldPlayEngine_ = true;
      }
    }
  }
}

function hasPipe(tile: Tile, side: number): boolean {
  if (tile === undefined) return false;
  if (tile.type === TileType.BLOCKED) return false;
  if (tile.type !== TileType.PIPES) return true;
  return tile.layout[side] > 0;
}

function checkHelpers(tile1, tile2, side1, side2) {
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

function hasHelpers(tile: Tile): boolean {
  if (tile === undefined) return false;
  return tile.type === TileType.GRATE_MACHINE || tile.type === TileType.STEAM_ENGINE;
}

function checkMachineTile(tile: Tile): number | undefined {
  if (tile === undefined || tile.type !== TileType.GRATE_MACHINE) return undefined;
  if (tile.helpers === undefined) return 0;
  let sum = 0;
  for (const value of tile.helpers) sum += value;
  return sum;
}