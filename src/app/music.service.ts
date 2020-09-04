import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private volume_: number;
  private music_: HTMLAudioElement;

  constructor() {
    const volume_from_settings = localStorage.getItem("music_volume");
    if(volume_from_settings) {
      this.volume = +volume_from_settings;
    } else {
      this.volume = 100;
    }
  }

  public get music(): HTMLAudioElement {
    return this.music_;
  }

  public set music(newMusic: HTMLAudioElement) {
    this.music_ = newMusic;
    this.music.loop = true;
  }

  public play(): void {
    var promise = this.music.play();
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
    localStorage.setItem("music_volume", newVolume.toString());
    this.volume_ = newVolume;
    if(this.music)
      this.music.volume = this.volume;
  }

  public resetVolume(): void {
    this.volume = 100;
  }

}
