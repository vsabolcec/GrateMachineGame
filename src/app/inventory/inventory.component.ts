import { Component } from '@angular/core';
import { TileType, Orientation, Domino } from '../domino/domino.component';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  dominos: Domino[] = [];

  activeIndex = 0;

  constructor(private readonly inventoryService: InventoryService) {
    // generate all possible dominos and store them
    for (let i = 1; i <= 3; ++i) {
      for (let j1 = 0; j1 <= 3; ++j1) {
        for (let j2 = 0; j2 <= 3; ++j2) {
          for (let j3 = 0; j3 <= 3; ++j3) {
            let f = i;
            if (i != j1 + j2 + j3) {
              if (j1 != 0 || j3 != 0 || j2 == 0) continue;
              f = j2;
            }
            const domino: Domino = {
              tiles: [
                {
                  type: TileType.PIPES,
                  layout: [i, 0, i, 0],
                },
                {
                  type: TileType.PIPES,
                  layout: [f, j1, j2, j3]
                }
              ],
              orientation: Orientation.HORIZONTAL
            };
            this.dominos.push(domino);
            console.log(domino);
          }
        }
      }
    }
  }

  select(index: number): void {
    this.activeIndex = index;
    this.inventoryService.changeDomino(this.dominos[index]);
  }
}
