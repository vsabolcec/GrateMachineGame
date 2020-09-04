import { Component } from '@angular/core';
import { Tile, TileType } from '../tile/tile.component';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  tiles: Tile[] = [];

  activeIndex: number;

  constructor(private readonly inventoryService: InventoryService) {
    // generate all possible dominos and store them
    for (let a = 0; a <= 1; ++a) {
      for (let b = 0; b <= 1; ++b) {
        for (let c = 0; c <= 1; ++c) {
          for (let d = 0; d <= 1; ++d) {
            if (a + b + c + d == 2) {
              const tile: Tile = {
                type: TileType.PIPES,
                layout: [a, b, c, d]
              }
              this.tiles.push(tile);
            }
          }
        }
      }
    }
  }

  select(index: number): void {
    this.activeIndex = index;
    this.inventoryService.changeDomino(this.tiles[index]);
  }
}
