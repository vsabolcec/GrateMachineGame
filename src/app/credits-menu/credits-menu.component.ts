import { Component, OnInit } from '@angular/core';
import { StatesService, State } from '../states.service';

@Component({
  selector: 'app-credits-menu',
  templateUrl: './credits-menu.component.html',
  styleUrls: ['./credits-menu.component.scss']
})
export class CreditsMenuComponent implements OnInit {

  constructor(private readonly statesService: StatesService) { }

  ngOnInit(): void {
  }

  back() {
    this.statesService.changeState(State.START_MENU);
  }
}
