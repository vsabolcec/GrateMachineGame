import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { InventoryService } from '../inventory.service';
import { Board } from './board';
import { Tile, TileType } from '../tile/tile.component';
import { deepCopy } from '../utils';
import { State, StatesService } from '../states.service';

const BLOCK_SIZE: number = 64;

interface Placeholder {
  tile: Tile,
  boardX: number,
  boardY: number,
  style: {
    display: 'none'|'block',
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

  constructor(
      private readonly inventoryService: InventoryService,
      private readonly statesService: StatesService) {}

  ngOnInit() {
    this.board = new Board(this.width, this.height);
    this.inventoryService.observer.subscribe((tile: Tile) => {
      this.placeholder = {
        tile: deepCopy(tile),
        boardX: 0,
        boardY: 0,
        style: { display: 'none', left: '0', top: '0' },
        placeable: false
      };
    });

    // set styles...
    const outerWidth = this.width * BLOCK_SIZE + 14;
    const outerHeight = this.height * BLOCK_SIZE + 14;
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
      this.board.placeTile(this.placeholder.tile, this.placeholder.boardX, this.placeholder.boardY);
      this.placedTiles.push({
        tile: deepCopy(this.placeholder.tile),
        style: {
          left: `${this.placeholder.boardX * BLOCK_SIZE}px`,
          top: `${this.placeholder.boardY * BLOCK_SIZE}px`
        }
      });
      console.log(this.placedTiles);
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

  increaseOffset(delta: number) {
    this.boardOffset += delta;
    this.boardRef.nativeElement.style.marginLeft = `${-this.boardOffset * BLOCK_SIZE}px`;
  }

  back() {
    this.statesService.changeState(State.START_MENU);
  }
}

function rotateTile(tile: Tile) {
  tile = deepCopy(tile);
  if (tile.type === TileType.PIPES) {
    tile.layout.push(tile.layout.shift());
  }
  return tile;
}