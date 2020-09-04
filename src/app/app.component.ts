import { Component } from '@angular/core';
import { State, StatesService } from './states.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  state: State = State.START_MENU;

  constructor(private readonly statesService: StatesService) {
    this.statesService.observer.subscribe((state) => { this.state = state; });
  }
}
