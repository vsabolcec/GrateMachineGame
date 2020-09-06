import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private volume_: number;
  //private soundMap_: Map<string, HTMLAudioElement> = new Map();
  private soundMap_: Map<string, string> = new Map();

  constructor() {
    const volume_from_settings = localStorage.getItem("sound_volume");
    if(volume_from_settings) {
      this.volume = +volume_from_settings;
    } else {
      this.volume = 100;
    }
  }


  public set(key: string, value: HTMLAudioElement) {
    this.soundMap_[key] = value;
  }


  public play(key: string): void {
    if(!this.soundMap_[key])
      return;
    const audio = this.soundMap_[key];
    audio.volume = this.volume / 100;
    audio.pause();
    audio.currentTime = 0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(error => {
        console.log(error, "For the best experience allow the website to play audio automatically.");
      });
    }
  }

  public get volume(): number {
    return this.volume_;
  }

  public set volume(newVolume: number) {
    localStorage.setItem("sound_volume", newVolume.toString());
    this.volume_ = newVolume;
  }

  public resetVolume(): void {
    this.volume = 100;
  }

}
