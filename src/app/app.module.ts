import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DominoComponent } from './domino/domino.component';
import { BoardComponent } from './board/board.component';
import { InventoryComponent } from './inventory/inventory.component';
import { StartMenuComponent } from './start-menu/start-menu.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { CreditsMenuComponent } from './credits-menu/credits-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    DominoComponent,
    BoardComponent,
    InventoryComponent,
    StartMenuComponent,
    OptionsMenuComponent,
    CreditsMenuComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
