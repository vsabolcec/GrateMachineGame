import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum State {
  START_MENU = 'START_MENU',
  OPTIONS_MENU = 'OPTIONS_MENU',
  GAME = 'GAME',
  CREDITS = 'CREDITS',
  NEW_GAME = 'NEW_GAME'  // very hacky - different than 'game'
}

@Injectable({
  providedIn: 'root'
})
export class StatesService {
  private subject: Subject<State> = new Subject();
  
  started = false;  // has game started?

  changeState(state: State) {
    if (state === State.GAME) {
      this.started = true;
    } else if (state === State.NEW_GAME) {
      this.started = false;
    }
    this.subject.next(state);
  }

  get observer(): Observable<State> {
    return this.subject.asObservable();
  }
}
