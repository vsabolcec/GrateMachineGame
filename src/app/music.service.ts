import { HostListener, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private volume_: number = 100;
  private music_: HTMLAudioElement;
  private muted_: boolean = false;

  constructor() {}

  public get music(): HTMLAudioElement {
    return this.music_;
  }

  public set music(newMusic: HTMLAudioElement) {
    this.music_ = newMusic;
    this.music.loop = true;
  }

  public play(): void {
    if(!this.music)
      return;
    this.music.volume = this.volume / 100;
    var promise = this.music.play();
    if (promise !== undefined) {
        promise.catch(error => {
          console.log(error, "For the best experience allow the website to play audio automatically.");
        });
    }
    if (this.muted_) {
      this.music.pause();
    }
  }

  public get volume(): number {
    return this.volume_;
  }

  public set volume(newVolume: number) {
    this.volume_ = newVolume;
    if(this.music)
      this.music.volume = this.volume / 100;
    if (this.muted_) {
      this.toggleMuted();
    }
  }

  public resetVolume(): void {
    this.volume = 100;
  }

  public toggleMuted(): void {
    this.muted_ = !this.muted_;
    if (this.muted_) {
      this.music.pause();
    } else {
      this.music.play();
    }
  }
}
