import { Component } from '@angular/core';
import { State, StatesService } from './states.service';
import { MusicService } from './music.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  state: State = State.START_MENU;

  constructor(private readonly statesService: StatesService,
              private readonly musicService: MusicService) {
    this.statesService.observer.subscribe((state) => { this.state = state; });
    //musicService.music = new Audio("../assets/sound/button_click.wav");
    //musicService.play();
    //^play background music here^
  }
}
