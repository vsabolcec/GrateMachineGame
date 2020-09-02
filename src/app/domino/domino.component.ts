import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { deepCopy } from '../utils';

export enum TileType {
  PIPES = 'PIPES',
  GRATE_GENERATOR = 'GRATE_GENERATOR',
  STEAM_ENGINE = 'STEAM_ENGINE'
}

export enum Orientation {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

// A single block (1x1) tile consisting of pipes.
export interface PipesTile {
  type: TileType.PIPES,
  layout: Array<number>
}

export interface GrateGeneratorTile {
  type: TileType.GRATE_GENERATOR
}

// Tile polymorphism.
export type Tile = PipesTile | GrateGeneratorTile;

// Domino consists of an array (two) of tiles and orientation.
export interface Domino {
  tiles: Array<Tile>,
  orientation: Orientation
}

@Component({
  selector: 'domino',
  templateUrl: './domino.component.html',
  styleUrls: ['./domino.component.scss']
})
export class DominoComponent implements OnInit, OnChanges {
  @Input() domino!: Domino;

  blocks: string[] = [];
  transition?: string;

  ngOnInit(): void {
    this.updateContent();
  }

  ngOnChanges(): void {
    this.updateContent();
  }

  private updateContent(): void {
    if (this.domino) {
      this.blocks = this.domino.tiles.map(getBlockCode);
      this.transition = getTransitionCode(this.domino);
      return;
    }
  }
}

// Returns class code for block tile
function getBlockCode(tile: Tile): string {
  if (tile.type == TileType.PIPES) {
    return 'block-' + (tile as PipesTile).layout.join('-');
  }
  return '';
}

// Returns class code of transition tile if applicable
function getTransitionCode(domino: Domino): string | undefined {
  const tile1 = domino.tiles[0] as PipesTile;
  const tile2 = domino.tiles[1] as PipesTile;
  if (tile1.layout.reduce((a, b) => a + b, 0) ==
      tile2.layout.reduce((a, b) => a + b, 0)) {
    return undefined;
  }
  const first = Math.max(tile1.layout[0], tile1.layout[1]);
  const second = Math.max(tile2.layout[0], tile2.layout[1]);
  return `transition-${first}-${second}`;
}

// Rotates domino by 90 degrees clockwise
export function rotateDomino(domino: Domino): Domino {
  domino = deepCopy(domino);  // create a copy
  if (domino.orientation == Orientation.HORIZONTAL) {
    domino.orientation = Orientation.VERTICAL;
  } else {
    domino.orientation = Orientation.HORIZONTAL;
  }
  for (let tile of domino.tiles) {
    if (tile.type == TileType.PIPES) {
      tile.layout.unshift(tile.layout.pop());
    }
  }
  if (domino.orientation == Orientation.HORIZONTAL) {
    domino.tiles.unshift(domino.tiles.pop());
  }
  return domino;
}