import { Component } from '@angular/core';
import { State, StatesService } from './states.service';
import { MusicService } from './music.service';
import { SoundService } from './sound.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  state: State = State.START_MENU;

  constructor(private readonly statesService: StatesService,
              private readonly musicService: MusicService,
              private readonly soundService: SoundService) {
    this.statesService.observer.subscribe((state) => { this.state = state; });
    //musicService.music = new Audio("../assets/sound/button_click.wav");
    //musicService.play();
    //^play background music here^
  }

  back() {
    this.statesService.changeState(State.START_MENU);
    this.soundService.play('button_click');
  }
}
