import { Tile } from '../tile/tile.component';
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
    return this.tiles[x][y] === undefined;
  }
}