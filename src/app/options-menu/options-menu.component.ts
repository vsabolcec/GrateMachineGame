import { Component, OnInit } from '@angular/core';
import { StatesService, State } from '../states.service';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss']
})
export class OptionsMenuComponent implements OnInit {

  constructor(private readonly statesService: StatesService) { }

  ngOnInit(): void {
  }

  back() {
    this.statesService.changeState(State.START_MENU);
  }
}
