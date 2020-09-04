import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum State {
  START_MENU = 'START_MENU',
  OPTIONS_MENU = 'OPTIONS_MENU',
  GAME = 'GAME',
  CREDITS = 'CREDITS'
}

@Injectable({
  providedIn: 'root'
})
export class StatesService {
  private subject: Subject<State> = new Subject();

  changeState(state: State) {
    this.subject.next(state);
  }

  get observer(): Observable<State> {
    return this.subject.asObservable();
  }
}
