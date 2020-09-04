import { Component } from '@angular/core';
import { StatesService, State } from '../states.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent {

  constructor(private readonly statesService: StatesService, private readonly soundService: SoundService) {
    soundService.add('button_click', new Audio("../../assets/sound/button_click.wav"));
  }

  startGame() {
    this.statesService.changeState(State.GAME);
    this.soundService.play('button_click');
  }

  startOptions() {
    this.statesService.changeState(State.OPTIONS_MENU);
    this.soundService.play('button_click');
  }

  startCredits() {
    this.statesService.changeState(State.CREDITS);
    this.soundService.play('button_click');
  }
}
