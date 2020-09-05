import { Tile, TileType } from '../tile/tile.component';
import { deepCopy } from '../utils';
import { Graph } from './graph';

export class Board {
  private tiles: Array<Array<Tile | undefined>> = [];
  private modifiers: Array<Array<number>> = [];
  private graph: Graph = new Graph();

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
    return true;
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
        console.log("HEY");
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
}

function hasPipe(tile: Tile, side: number): boolean {
  if (tile === undefined) return false;
  if (tile.type === TileType.BLOCKED) return false;
  if (tile.type !== TileType.PIPES) return true;
  return tile.layout[side] > 0;
}
