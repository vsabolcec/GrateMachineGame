import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InventoryTiles, InventoryTileType } from './game/level';

import { Tile } from './tile/tile.component';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private subject: Subject<InventoryTileType | undefined> = new Subject();
  private bonusAcquiredSubject: Subject<InventoryTiles> = new Subject();
  private reduceSubject: Subject<InventoryTileType> = new Subject();

  changeDomino(tile: InventoryTileType | undefined) {
    this.subject.next(tile);
  }

  get observer(): Observable<InventoryTileType | undefined> {
    return this.subject.asObservable();
  }

  addBonus(bonus: InventoryTiles) {
    return this.bonusAcquiredSubject.next(bonus);
  }

  get bonusAcquired(): Observable<InventoryTiles> {
    return this.bonusAcquiredSubject.asObservable();
  }

  reduceTile(tile: InventoryTileType) {
    this.reduceSubject.next(tile);
  }

  get reduced(): Observable<InventoryTileType> {
    return this.reduceSubject.asObservable();
  }
}
