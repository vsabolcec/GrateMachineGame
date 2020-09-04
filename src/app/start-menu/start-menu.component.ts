import { Component } from '@angular/core';
import { StatesService, State } from '../states.service';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent {

  constructor(private readonly statesService: StatesService) {}

  startGame() {
    this.statesService.changeState(State.GAME);
  }

  startOptions() {
    this.statesService.changeState(State.OPTIONS_MENU);
  }

  startCredits() {
    this.statesService.changeState(State.CREDITS);
  }
}
