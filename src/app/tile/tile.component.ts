import { Component, OnInit, Input } from '@angular/core';

export enum TileType {
  PIPES = 'PIPES',
  GRATE_MACHINE = 'GRATE_MACHINE',
  STEAM_ENGINE = 'STEAM_ENGINE',
  BLOCKED = 'BLOCKED'
}

// A single block (1x1) tile consisting of pipes.
export interface PipesTile {
  type: TileType.PIPES,
  layout: Array<number>
}

export interface GrateMachineTile {
  type: TileType.GRATE_MACHINE
}

export interface SteamEngineTile {
  type: TileType.STEAM_ENGINE
}

export interface BlockedTile {
  type: TileType.BLOCKED
}

// Tile polymorphism.
export type Tile = PipesTile | GrateMachineTile | SteamEngineTile | BlockedTile;

@Component({
  selector: 'tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() tile: Tile;
  
  tileClasses: string[] = [];

  ngOnInit(): void {
    this.updateTile();
  }

  ngOnChanges(changes: any): void {
    this.updateTile();
  }

  private updateTile(): void {
    if (this.tile.type == TileType.PIPES) {
      this.tileClasses = ['tile-pipes'];
      this.tileClasses.push('tile-pipes-' + this.tile.layout.join(''));
    } else if (this.tile.type == TileType.STEAM_ENGINE) {
      this.tileClasses = ['tile-steam'];
    } else if (this.tile.type == TileType.BLOCKED) {
      this.tileClasses = ['tile-blocked'];
    }
    // etc..
  }
}
