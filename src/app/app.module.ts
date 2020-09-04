import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { InventoryComponent } from './inventory/inventory.component';
import { TileComponent } from './tile/tile.component';
import { StartMenuComponent } from './start-menu/start-menu.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { CreditsMenuComponent } from './credits-menu/credits-menu.component';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    InventoryComponent,
    TileComponent,
    StartMenuComponent,
    OptionsMenuComponent,
    CreditsMenuComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
