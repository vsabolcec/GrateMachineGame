import { Component, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
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

interface TypedPosition {
  pos: Position,
  inventoryTile: InventoryTileType
}

interface PlacedTile {
  tile: Tile,
  style: { left: string, top: string }
}

interface SteamPart {
  side: number,
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
  private board: Board = new Board();

  placeholder?: Placeholder = undefined;

  placedTiles: PlacedTile[] = [];

  steamParts: SteamPart[] = [];

  totalLevels: number = LEVELS.length;

  // Last mouse position
  private mouseBoardPos: { x: number, y: number };

  // In the number of tiles
  private boardOffset: number = 0;

  // Location of steam engine that, once it is connected to a pipe,
  // should trigger offset increment
  private targetPos: Position;

  // Current score, updated from board
  score = 0;
  PIPE_VALUE = 10;
  GRATE_VALUE = 100;

  levelIndex = 0;

  // Array of tiles in the order they were put on the board.
  private undoBuffer: Array<TypedPosition>;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly statesService: StatesService,
    private readonly soundService: SoundService) {}

  ngOnInit() {
    // Ensure we work with numbers!
    this.width -= 0;
    this.height -= 0;
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
      marginLeft: `${-outerWidth / 2}px`
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

    // setup blocked fields
    if (level.blockedFields !== undefined) {
      for (let j = 0; j < this.height; ++j) {
        for (let i = 0; i < this.width; ++i) {
          if (level.blockedFields[j][i] === '1') {
            this.placeTile({type: TileType.BLOCKED}, this.boardOffset + i, j);
          }
        }
      }
    }

    // setup grate machines
    if (level.grateMachines !== undefined) {
      for (const machine of level.grateMachines) {
        this.placeTile({type: TileType.GRATE_MACHINE}, this.boardOffset + machine.x, machine.y);
      }
    }

    // reset undo buffer
    this.undoBuffer = []

    this.startMessages(level.messages);
  }

  onMouseMove(event: MouseEvent): void {
    event.preventDefault();
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
      this.placeTilePlayer(this.placeholder.tile, this.placeholder.boardX, this.placeholder.boardY, this.placeholder.inventoryTile);
      this.placeholder.placeable = false;
      this.inventoryService.reduceTile(this.placeholder.inventoryTile);
      const level = LEVELS[this.levelIndex];
      const context: GameContext = {  // << move this to a separate method
        gratesRound: 0,
        gratesTotal: 0,
        board: this.board,
        fromX: this.boardOffset,
        toX: this.boardOffset + this.width - 1,
        level
      };
      if (level.completed(context)) {
        this.setLevel(this.levelIndex + 1);
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.placeholder) return;
    if (event.key == 'q' || event.key == 'Q') {
      this.placeholder.tile = rotateTile(this.placeholder.tile);
      this.updatePlaceholder();
    }
    if (event.key == 'e' || event.key == 'E' || event.key == 'r' || event.key == 'R') {
      this.placeholder.tile = rotateTile(this.placeholder.tile);
      this.placeholder.tile = rotateTile(this.placeholder.tile);
      this.placeholder.tile = rotateTile(this.placeholder.tile);
      this.updatePlaceholder();
    }
    if (event.key == '1' || event.key == '2' || event.key == '3') {
      this.updatePlaceholder();
    }
    if (event.key == 'u' || event.key == 'U') {
      this.undo();
      this.updatePlaceholder();
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

  undo() {
    this.soundService.play('button_click');
    if (this.undoBuffer.length == 0) return;
    var lastTile = this.undoBuffer[this.undoBuffer.length - 1]
    this.removeTile(lastTile.pos.x, lastTile.pos.y);
    this.inventoryService.increaseTile(lastTile.inventoryTile);
    this.undoBuffer.splice(-1, 1);
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
        setTimeout(() => { timeable(messages, lvl, messageIndex + 1, 0); }, 500);
      }
    };
    setTimeout(() => { timeable(messages, this.levelIndex, 0, 0); }, 500);
  }


  private placeTilePlayer(tile: Tile, x: number, y: number, tileType: InventoryTileType) {
    this.placeTile(tile, x, y);
    this.undoBuffer.push(
      {pos: {x: x,
             y: y},
       inventoryTile: tileType});
    if (tile.type === TileType.PIPES) {
      this.soundService.play('pipe_placement');
    }
    if (this.board.shouldPlayEngine) {
      this.soundService.play('engine_starting');
    }
  }

  private placeTile(tile: Tile, x: number, y: number) {
    if (!this.board.placeTile(tile, x, y)) return;
    this.updateTiles();
  }

  private removeTile(x: number, y: number) {
    this.board.removeTile(x, y);
    this.updateTiles();
  }

  private updateTiles() {
    this.checkScore()

    const tiles = this.board.getTiles(this.boardOffset - this.width, this.boardOffset + this.width);
    const convert = (e => {
      return {
        tile: e.tile,
        style: {left: `${e.x * BLOCK_SIZE}px`, top: `${e.y * BLOCK_SIZE}px`}
      }
    });
    this.placedTiles = tiles.map(convert);

    const steam = this.board.getSteam(this.boardOffset, this.boardOffset + this.width);
    this.steamParts = steam.map(e => {
      return {
        side: e.side,
        style: {left: `${e.x * BLOCK_SIZE}px`, top: `${e.y * BLOCK_SIZE}px`}
      };
    });
  }

  checkScore() {
    this.score = 0
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        if (this.board.isConnected(this.boardOffset + 0, 2, this.boardOffset + i, j)) {
          var tile = this.board.get(this.boardOffset + i, j);
          if (tile.type == TileType.PIPES) {
            this.score += this.PIPE_VALUE;
          }
          if (tile.type == TileType.GRATE_MACHINE) {
            this.score += this.GRATE_VALUE
          }
        }
      }
    }
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
  if (inventoryTile === InventoryTileType.PLUS_PIPES) {
    return deepCopy(INVENTORY_CONSTS.PLUS_PIPE_TILE);
  }
  console.log('fromInventoryTile: should NOT reach this line');
  return undefined;
}
