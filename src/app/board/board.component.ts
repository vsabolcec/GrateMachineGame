import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { InventoryService } from '../inventory.service';
import { Board } from './board';
import { Tile, TileType } from '../tile/tile.component';
import { deepCopy } from '../utils';
import { State, StatesService } from '../states.service';
import { InventoryTileType, LEVELS, GameContext } from '../game/level';
import { INVENTORY_CONSTS } from '../inventory/inventory.component';
import { SoundService } from '../sound.service';

const BLOCK_SIZE: number = 64;

interface Placeholder {
  tile: Tile,
  inventoryTile: InventoryTileType,
  boardX: number,
  boardY: number,
  style: {
    display: 'none' | 'block',
    left: string,
    top: string
  },
  placeable: boolean
}

interface Position {
  x: number,
  y: number
}

interface PlacedTile {
  tile: Tile,
  style: { left: string, top: string }
}

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @ViewChild('boardRef') boardRef: ElementRef;
  @ViewChild('bbb') bbb:ElementRef;
  @Input() width: number;
  @Input() height: number;

  // styles...
  boardOuterStyle: {};
  boardOverflowStyle: {};
  boardStyle: {};

  // Board management
  private board: Board;

  placeholder?: Placeholder = undefined;

  placedTiles: PlacedTile[] = [];

  // Last mouse position
  private mouseBoardPos: { x: number, y: number };

  // In the number of tiles
  private boardOffset: number = 0;

  // Location of steam engine that, once it is connected to a pipe,
  // should trigger offset increment
  private targetPos: Position;

  levelIndex = 0;

  constructor(
      private readonly inventoryService: InventoryService,
      private readonly statesService: StatesService,
      private readonly soundService: SoundService) {}

  ngOnInit() {
    // Ensure we work with numbers!
    this.width -= 0;
    this.height -= 0;
    this.board = new Board(this.width, this.height);
    this.inventoryService.observer.subscribe((inventoryTile: InventoryTileType) => {
      if (inventoryTile === undefined) {
        this.placeholder = undefined;
      } else {
        this.placeholder = {
          tile: fromInventoryTile(inventoryTile),
          inventoryTile: inventoryTile,
          boardX: 0,
          boardY: 0,
          style: { display: 'none', left: '0', top: '0' },
          placeable: false
        };
      }
    });

    // set styles...
    const outerWidth = this.width * BLOCK_SIZE + 28;
    const outerHeight = this.height * BLOCK_SIZE + 28;
    this.boardOuterStyle = {
      width: `${outerWidth}px`,
      height: `${outerHeight}px`,
      marginLeft: `${-outerWidth / 2}px`,
      marginTop: `${-outerHeight / 2}px`
    };
    this.boardOverflowStyle = {
      width: `${this.width * BLOCK_SIZE}px`,
      height: `${this.height * BLOCK_SIZE}px`,
    };
    this.boardStyle = { height: `${this.height * BLOCK_SIZE}px` };

    this.setLevel(0);
  }

  setLevel(index: number) {
    if (index >= LEVELS.length) {
      console.log('YOU WON');
      return;
    }

    this.levelIndex = index;
    const level = LEVELS[index];
    this.inventoryService.addBonus(level.startingBonus);

    this.boardOffset = index * (this.width - 1);
    if (this.boardRef) {
      this.boardRef.nativeElement.style.marginLeft = `${-this.boardOffset * BLOCK_SIZE}px`;
    }

    // setup steam engines
    this.placeTile({type: TileType.STEAM_ENGINE}, this.boardOffset, 2);
    this.placeTile({type: TileType.STEAM_ENGINE}, this.boardOffset + this.width - 1, 2);

    this.placeTile({type: TileType.BLOCKED}, 14, 2);

    this.startMessages(level.messages);
  }

  onMouseMove(event: MouseEvent): void {
    const boardOffset = this.boardRef.nativeElement.getBoundingClientRect();
    this.mouseBoardPos = {
      x: event.clientX - boardOffset.left,
      y: event.clientY - boardOffset.top
    };
    if (this.placeholder) {
      this.updatePlaceholder();
    }
  }

  onScroll(event: WheelEvent): void {
    if (this.placeholder) {
      if (event.deltaY < 0) {
        this.placeholder.tile = rotateTile(this.placeholder.tile);
      } else {
        this.placeholder.tile = rotateTile(this.placeholder.tile);
        this.placeholder.tile = rotateTile(this.placeholder.tile);
        this.placeholder.tile = rotateTile(this.placeholder.tile);
      }
      this.updatePlaceholder();
    }
  }

  onClick() {
    if (this.placeholder !== undefined && this.placeholder.placeable) {
      this.placeTile(this.placeholder.tile, this.placeholder.boardX, this.placeholder.boardY);
      this.placeholder.placeable = false;
      this.inventoryService.reduceTile(this.placeholder.inventoryTile);
      const level = LEVELS[this.levelIndex];
      const context: GameContext = {  // << move this to a separate method
        gratesRound: 0,
        gratesTotal: 0,
        board: this.board,
        fromX: this.boardOffset,
        toX: this.boardOffset + this.width - 1
      };
      if (level.completed(context)) {
        this.setLevel(this.levelIndex + 1);
      }
    }
  }

  private updatePlaceholder(): void {
    const boardPos = this.boardPosition(this.mouseBoardPos);
    if (boardPos === undefined) {
      this.placeholder.style.display = 'none';
      this.placeholder.placeable = false;
      return;
    }
    this.placeholder.boardX = boardPos.x;
    this.placeholder.boardY = boardPos.y;
    this.placeholder.style.display = 'block';
    this.placeholder.style.left = `${boardPos.x * BLOCK_SIZE}px`;
    this.placeholder.style.top = `${boardPos.y * BLOCK_SIZE}px`;
    this.placeholder.placeable = this.board.canPlaceTile(this.placeholder.tile, boardPos.x, boardPos.y);
  }

  private boardPosition(mouse: Position): Position|undefined {
    if (mouse.x < this.boardOffset * BLOCK_SIZE || mouse.y < 0 ||
        mouse.x >= (this.width + this.boardOffset) * BLOCK_SIZE ||
        mouse.y >= this.height * BLOCK_SIZE) {
      return undefined;
    }
    return {
      x: Math.floor(mouse.x / BLOCK_SIZE),
      y: Math.floor(mouse.y / BLOCK_SIZE)
    };
  }

  back() {
    this.statesService.changeState(State.START_MENU);
    this.soundService.play('button_click');
  }

  undo() {

  }

  messages: string[][] = [];

  private startMessages(messages: string[]) {
    this.messages.push([]);
    const timeable = (messages: string[], lvl: number, messageIndex: number, letterIndex: number) => {
      if (lvl != this.levelIndex) return;
      if (messageIndex >= messages.length) return;
      if (letterIndex === 0) this.messages[lvl].push("");
      if (letterIndex < messages[messageIndex].length) {
        const last = this.messages[lvl].pop();
        const letter = messages[messageIndex][letterIndex];
        this.messages[lvl].push(last + letter);
        setTimeout(() => { timeable(messages, lvl, messageIndex, letterIndex + 1); }, 30);
      } else {
        setTimeout(() => { timeable(messages, lvl, messageIndex + 1, 0); }, 800);
      }
    };
    timeable(messages, this.levelIndex, 0, 0);
  }


  private placeTile(tile: Tile, x: number, y: number) {
    if (!this.board.placeTile(tile, x, y)) return;
    const tiles = this.board.getTiles(this.boardOffset - this.width, this.boardOffset + this.width);
    const convert = (e => {
      return {
        tile: e.tile,
        style: {left: `${e.x * BLOCK_SIZE}px`, top: `${e.y * BLOCK_SIZE}px`}
      }
    });
    this.placedTiles = tiles.map(convert);
  }
}

function rotateTile(tile: Tile) {
  tile = deepCopy(tile);
  if (tile.type === TileType.PIPES) {
    tile.layout.push(tile.layout.shift());
  }
  return tile;
}

function fromInventoryTile(inventoryTile: InventoryTileType): Tile | undefined {
  if (inventoryTile === InventoryTileType.STRAIGHT_PIPE) {
    return deepCopy(INVENTORY_CONSTS.STRAIGHT_PIPE_TILE);
  }
  if (inventoryTile === InventoryTileType.TURN_PIPE) {
    return deepCopy(INVENTORY_CONSTS.TURN_PIPE_TILE);
  }
  console.log('fromInventoryTile: should NOT reach this line');
  return undefined;
}
