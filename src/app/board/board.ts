import { Tile, TileType } from '../tile/tile.component';
import { deepCopy } from '../utils';

export class Board {
  private tiles: Array<Array<Tile | undefined>> = [];
  private modifiers: Array<Array<number>> = [];

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

  placeTile(tile: Tile, x: number, y: number): void {
    this.tiles[x][y] = deepCopy(tile);
  }

  canPlaceTile(tile: Tile, x: number, y: number): boolean {
    if (this.tiles === undefined || this.tiles[x] === undefined)
      return false;
    if (this.tiles[x][y] !== undefined) return false;
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const side = [2, 3, 0, 1];
    for (let i = 0; i < 4; ++i) {
      const otherTile = this.get(x + dx[i], y + dy[i]);
      if (otherTile === undefined) continue;
      if (hasPipe(tile, side[i]) && hasPipe(otherTile, (side[i] + 2) % 4)) {
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
}

function hasPipe(tile: Tile, side: number): boolean {
  if (tile.type !== TileType.PIPES) return true;
  return tile.layout[side] > 0;
}