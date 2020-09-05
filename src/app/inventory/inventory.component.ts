import { Component } from '@angular/core';
import { Tile, TileType } from '../tile/tile.component';
import { InventoryService } from '../inventory.service';
import { InventoryTiles, InventoryTileType } from '../game/level';
import { deepCopy } from '../utils';

export const INVENTORY_CONSTS = {
  STRAIGHT_PIPE_TILE : {
    type: TileType.PIPES,
    layout: [1, 0, 1, 0]
  },
  TURN_PIPE_TILE : {
    type: TileType.PIPES,
    layout: [1, 1, 0, 0]
  }
};

@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  inventory: InventoryTiles;
  active: InventoryTileType;

  // export to template
  INVENTORY_CONSTS = INVENTORY_CONSTS;

  get tiles(): Tile[] {
    if (this.inventory === undefined) return [];
    const ret = [];
    if (this.inventory.straightPipes && this.inventory.straightPipes > 0) {
      ret.push({type: TileType.PIPES, layout: [1, 0, 1, 0]});
    }
    if (this.inventory.turnPipes && this.inventory.turnPipes > 0) {
      ret.push({type: TileType.PIPES, layout: [1, 1, 0, 0]});
    }
    return ret;
  }

  constructor(private readonly inventoryService: InventoryService) {
    this.inventoryService.bonusAcquired.subscribe((bonus: InventoryTiles) => {
      // TODO: merge instead of set
      this.inventory = deepCopy(bonus);
    });
    this.inventoryService.reduced.subscribe((inventoryTile) => {
      this.reduce(inventoryTile);
    });
    this.inventoryService.increased.subscribe((inventoryTile) => {
      this.increase(inventoryTile);
    });
  }

  setActive(inventoryTileType: InventoryTileType) {
    this.active = inventoryTileType;
    this.inventoryService.changeDomino(inventoryTileType);
  }

  private reduce(inventoryTile: InventoryTileType) {
    switch (inventoryTile) {
      case InventoryTileType.STRAIGHT_PIPE:
        this.inventory.straightPipes--;
        this.checkAndSetUndefined(this.inventory.straightPipes);
        return;
      case InventoryTileType.TURN_PIPE:
        this.inventory.turnPipes--;
        this.checkAndSetUndefined(this.inventory.turnPipes);
        return;
      default:
        console.log('InventoryComp.reduce: should NOT reach this line');
    }
  }

  private increase(inventoryTile: InventoryTileType) {
    switch (inventoryTile) {
      case InventoryTileType.STRAIGHT_PIPE:
        this.inventory.straightPipes++;
        return;
      case InventoryTileType.TURN_PIPE:
        this.inventory.turnPipes++;
        return;
      default:
        console.log('InventoryComp.increase: should NOT reach this line');
    }
  }

  private checkAndSetUndefined(count: number) {
    if (count === 0) {
      this.inventoryService.changeDomino(undefined);
      this.active = undefined;
    }
  }
}
