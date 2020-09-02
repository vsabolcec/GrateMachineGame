import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {Domino} from './domino/domino.component';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private subject: Subject<Domino> = new Subject();

  constructor() { }

  changeDomino(domino: Domino) {
    this.subject.next(domino);
  }

  get observer(): Observable<Domino> {
    return this.subject.asObservable();
  }
}
