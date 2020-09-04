import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Tile } from './tile/tile.component';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private subject: Subject<Tile> = new Subject();

  constructor() { }

  changeDomino(tile: Tile) {
    this.subject.next(tile);
  }

  get observer(): Observable<Tile> {
    return this.subject.asObservable();
  }
}
