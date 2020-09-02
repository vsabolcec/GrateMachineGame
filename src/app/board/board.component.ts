import { Component, ElementRef, ViewChild } from '@angular/core';
import { Domino, TileType, Orientation, rotateDomino } from '../domino/domino.component';
import { InventoryService } from '../inventory.service';
import { Board, BOARD_SIZE, BLOCK_SIZE, PlacedDomino } from './board';

interface Placeholder {
  domino: Domino,
  boardX: number,
  boardY: number,
  style: {
    display: 'none' | 'inline-block',
    left: string,
    top: string
  }
}

interface Position {
  x: number,
  y: number
}

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @ViewChild('boardRef') boardRef: ElementRef;

  // Initial placeholder...
  placeholder: Placeholder = {
    domino: {
      tiles: [
        { type: TileType.PIPES, layout: [1, 0, 1, 0] },
        { type: TileType.PIPES, layout: [3, 0, 3, 0] }
      ],
      orientation: Orientation.HORIZONTAL
    },
    boardX: 0,
    boardY: 0,
    style: {
      display: 'none',
      left: '0',
      top: '0'
    }
  };

  // Board management
  private board: Board = new Board();

  // Getter for placed dominos from board object
  get dominos(): Array<PlacedDomino> {
    return this.board.dominos;
  }

  // Can placeholder be placed
  // TODO: move to placeholder interface?
  placeable: boolean = false;

  // Last mouse position
  private mouseBoardPos: { x: number, y: number };

  constructor(private readonly inventoryService: InventoryService) {
    // Observe inventory changes to update placeholder
    this.inventoryService.observer.subscribe((domino: Domino) => {
      this.placeholder.domino = { ...domino };
      console.log(this.placeholder);
    });
  }


  onMouseMove(event: MouseEvent): void {
    const boardOffset = this.boardRef.nativeElement.getBoundingClientRect();
    this.mouseBoardPos = {
      x: event.clientX - boardOffset.left,
      y: event.clientY - boardOffset.top
    };
    this.updatePlaceholder();
  }

  onScroll(e: WheelEvent): void {
    if (e.deltaY > 0) {
      // Rotate clockwise
      this.placeholder.domino = rotateDomino(this.placeholder.domino);
    } else {
      // Rotate counter-clocwise (3 times clockwise)
      this.placeholder.domino = rotateDomino(this.placeholder.domino);
      this.placeholder.domino = rotateDomino(this.placeholder.domino);
      this.placeholder.domino = rotateDomino(this.placeholder.domino);
    }
    this.updatePlaceholder();
  }

  onClick() {
    // If there is a placeholder and it is placeable.
    if (this.placeholder.style.display != 'none' && this.placeable) {
      this.board.addDomino(this.placeholder.domino, this.placeholder.boardX,
                           this.placeholder.boardY);
    }
  }

  private updatePlaceholder(): void {
    const boardPos = boardTransform(this.mouseBoardPos, this.placeholder);
    if (boardPos === undefined) {
      this.placeable = false;
      this.placeholder.style.display = 'none';
      return;
    }

    this.placeholder.style.display = 'inline-block';
    this.placeholder.style.left = `${boardPos.x * BLOCK_SIZE}px`;
    this.placeholder.style.top = `${boardPos.y * BLOCK_SIZE}px`;
    this.placeholder.boardX = boardPos.x;
    this.placeholder.boardY = boardPos.y;
    this.placeable = this.board.canPlaceDomino(this.placeholder.domino,
                                               this.placeholder.boardX,
                                               this.placeholder.boardY);
  }
}

// Transforms mouse coordinates relative to the board to the board position
function boardTransform(mouse: Position, placeholder: Placeholder): Position | undefined {
  if (mouse.x < 0 || mouse.y < 0 || mouse.x >= BLOCK_SIZE * BOARD_SIZE ||
    mouse.y >= BLOCK_SIZE * BOARD_SIZE) {
    return undefined;
  }
  let maxX = BOARD_SIZE - 1;
  let maxY = BOARD_SIZE - 1;
  let px = mouse.x / BLOCK_SIZE;
  let py = mouse.y / BLOCK_SIZE;
  if (placeholder.domino.orientation == Orientation.HORIZONTAL) {
    maxX--;
    px -= 0.5;
  }
  if (placeholder.domino.orientation == Orientation.VERTICAL) {
    maxY--;
    py -= 0.5
  }
  return {
    x: Math.max(0, Math.min(maxX, Math.floor(px))),
    y: Math.max(0, Math.min(maxY, Math.floor(py)))
  };
}