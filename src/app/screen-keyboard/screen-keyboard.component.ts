import { Component, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { CalcBtn } from './CalcBtn';
import { STD_KEYBOARD, EXTENDED_KEYBOARD, PROGRAMMER_KEYBOARD } from './keyboards';

@Component({
  selector: 'app-screen-keyboard',
  templateUrl: './screen-keyboard.component.html',
  styleUrls: ['./screen-keyboard.component.css']
})
export class ScreenKeyboardComponent {
  @Input() currInp: string;
  @Output() screenKeyClicked = new EventEmitter<string>();
  @ViewChild('mainDiv', { static: false }) myDiv: ElementRef<HTMLElement>;
  tiles: CalcBtn[];
  numCol: number = 5;

  constructor() {
    this.tiles = STD_KEYBOARD;
  }

  setKeyboard(mode: string) {
    if (mode == 'standard') {
      this.tiles = STD_KEYBOARD;
      this.numCol = 5;
    } else if (mode == 'extended') {
      this.tiles = EXTENDED_KEYBOARD;
      this.numCol = 6;
    } else if (mode == 'programmer') {
      this.tiles = PROGRAMMER_KEYBOARD;
      this.numCol = 6;
    }
  }

  tileClicked(k: CalcBtn) {
    this.screenKeyClicked.emit(k.fn(this.currInp));
  }

  simulateKeyDown(key: string) {
    let t = this.findTileByKey(key);
    if (t) {
      t.isPressed = true;
    }
  }

  simulateKeyUp(key: string) {
    let t = this.findTileByKey(key);
    if (t) {
      t.isPressed = false;
    }
  }

  simulateKeyPress(isDown: boolean, key: string) {
    let t = this.findTileByKey(key);
    if (t) {
      t.isPressed = isDown;
    }
  }

  findTileByKey(key: string) {
    return this.tiles.find(x => x.ids.find(x => x == key));
  }
}
