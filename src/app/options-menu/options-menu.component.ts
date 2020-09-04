import { Component, OnInit } from '@angular/core';
import { StatesService, State } from '../states.service';
import { SoundService } from '../sound.service';
import { MusicService } from '../music.service';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss']
})
export class OptionsMenuComponent implements OnInit {

  constructor(private readonly statesService: StatesService, 
              private readonly soundService: SoundService,
              private readonly musicService: MusicService) {}

  ngOnInit(): void {}

  back() {
    this.statesService.changeState(State.START_MENU);
    this.soundService.play('button_click');
  }

  testSoundVolume() {
    this.soundService.play('button_click'); //maybe add another sound effect for this one
  }

  resetToDefaults() {
    this.soundService.resetVolume();
    this.musicService.resetVolume();
    this.soundService.play('button_click');
  }

  set soundVolume(newVolume: number) {
    this.soundService.volume = newVolume;
  }

  get soundVolume(): number {
    return this.soundService.volume;
  }

  set musicVolume(newVolume: number) {
    this.musicService.volume = newVolume;
  }

  get musicVolume(): number {
    return this.musicService.volume;
  }

}