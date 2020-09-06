import { HostListener, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private volume_: number;
  private music_: HTMLAudioElement;
  private muted_: boolean;

  constructor() {
    const muted_from_settings = localStorage.getItem("music_muted");
    const volume_from_settings = localStorage.getItem("music_volume");
    if(volume_from_settings) {
      this.volume = +volume_from_settings;
    } else {
      this.volume = 100;
    }
    if (muted_from_settings == "yes") {
      this.muted_ = true;
    } else {
      this.muted_ = false;
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
    localStorage.setItem("music_volume", newVolume.toString());
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
      localStorage.setItem("music_muted", "yes");
    } else {
      this.music.play();
      localStorage.setItem("music_muted", "no");
    }
  }
}
