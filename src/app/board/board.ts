import { Domino, Tile, Orientation, PipesTile, TileType } from '../domino/domino.component';
import { deepCopy } from '../utils';

export const BOARD_SIZE: number = 7;
export const BLOCK_SIZE: number = 64;

// Domino with position to render
export interface PlacedDomino extends Domino {
  style: { left: string, top: string }
}

export class Board {
  private tiles: Array<Array<Tile | undefined>>;
  dominos: Array<PlacedDomino> = [];

  constructor() {
    this.tiles = [];
    for (let i = 0; i < BOARD_SIZE; ++i) {
      let row: Array<Tile | undefined> = [];
      for (let j = 0; j < BOARD_SIZE; ++j) {
        row.push(undefined);
      }
      this.tiles.push(row);
    }
  }

  addDomino(domino: Domino, x: number, y: number): void {
    domino = deepCopy(domino);
    this.dominos.push({
      ...domino,
      style: {
        left: `${x * BLOCK_SIZE}px`,
        top: `${y * BLOCK_SIZE}px`
      }
    });
    this.tiles[x][y] = domino.tiles[0];
    if (domino.orientation == Orientation.HORIZONTAL) {
      this.tiles[x + 1][y] = domino.tiles[1];
    } else {
      this.tiles[x][y + 1] = domino.tiles[1];
    }
    console.log(domino, this.tiles);
  }

  canPlaceDomino(domino: Domino, x: number, y: number): boolean {
    if (!this.canPlaceTile(domino.tiles[0] as PipesTile, x, y)) return false;
    if (domino.orientation == Orientation.HORIZONTAL) {
      return this.canPlaceTile(domino.tiles[1] as PipesTile, x + 1, y);
    }
    return this.canPlaceTile(domino.tiles[1] as PipesTile, x, y + 1);
  }

  private canPlaceTile(tile: PipesTile, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return false;
    if (this.tiles[x][y] != undefined) return false;
    if (x > 0 && !this.okPipes(x - 1, y, 2, tile.layout[0])) return false;
    if (x < 6 && !this.okPipes(x + 1, y, 0, tile.layout[2])) return false;
    if (y > 0 && !this.okPipes(x, y - 1, 3, tile.layout[1])) return false;
    if (y < 6 && !this.okPipes(x, y + 1, 1, tile.layout[3])) return false;
    return true;
  }

  private okPipes(x: number, y: number, side: number, match: number): boolean {
    const tile = this.tiles[x][y];
    if (tile == undefined) return true;
    if (tile.type != TileType.PIPES) return true;
    return tile.layout[side] == match;
  }
}