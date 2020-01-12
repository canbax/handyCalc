import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { CalcBtn } from './CalcBtn';

@Component({
  selector: 'app-screen-keyboard',
  templateUrl: './screen-keyboard.component.html',
  styleUrls: ['./screen-keyboard.component.css']
})
export class ScreenKeyboardComponent implements OnInit {
  @Input() currInp: string;
  @Output() screenKeyClicked = new EventEmitter<string>();
  @ViewChild('mainDiv', { static: false }) myDiv: ElementRef<HTMLElement>;
  tiles: CalcBtn[];

  constructor() {
    this.tiles = [
      { txt: 'sin', fn: (s) => { return s + 'sin(' }, ids: ['sin'] },
      { txt: 'cos', fn: (s) => { return s + 'cos(' }, ids: ['cos'] },
      { txt: 'tan', fn: (s) => { return s + 'tan(' }, ids: ['tan'] },
      { txt: 'x<sup>n</sup>', fn: (s) => { return s + '^' }, ids: ['Dead'] },
      { txt: '&#8730;x', fn: (s) => { return s + '^(0.5)' }, ids: ['square root'] },
      { txt: '7', fn: (s) => { return s + '7' }, ids: ['7'] },
      { txt: '8', fn: (s) => { return s + '8' }, ids: ['8'] },
      { txt: '9', fn: (s) => { return s + '9' }, ids: ['9'] },
      { txt: 'DEL', fn: (s) => { return s.slice(s.length - 1) }, ids: ['Delete', 'Backspace'] },
      { txt: 'C', fn: (s) => { return '' }, ids: ['='] },
      { txt: '4', fn: (s) => { return s + '4' }, ids: ['4'] },
      { txt: '5', fn: (s) => { return s + '5' }, ids: ['5'] },
      { txt: '6', fn: (s) => { return s + '6' }, ids: ['6'] },
      { txt: 'x', fn: (s) => { return s + '*' }, ids: ['x'] },
      { txt: '÷', fn: (s) => { return s + '÷' }, ids: ['/'] },
      { txt: '1', fn: (s) => { return s + '1' }, ids: ['1'] },
      { txt: '2', fn: (s) => { return s + '2' }, ids: ['2'] },
      { txt: '3', fn: (s) => { return s + '3' }, ids: ['3'] },
      { txt: '+', fn: (s) => { return s + '+' }, ids: ['+'] },
      { txt: '-', fn: (s) => { return s + '-' }, ids: ['-'] },
      { txt: '0', fn: (s) => { return s + '0' }, ids: ['0'] },
      { txt: '.', fn: (s) => { return s + '.' }, ids: ['.'] },
      { txt: '(', fn: (s) => { return s + '(' }, ids: ['('] },
      { txt: ')', fn: (s) => { return s + ')' }, ids: [')'] },
      { txt: '=', fn: (s) => { return s + '=' }, ids: ['='] }
    ];
  }

  ngOnInit() {
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
    console.log('simulateKeyPress down: ', isDown, ' key: ', key, ' date: ', new Date().getTime());
    if (t) {
      t.isPressed = isDown;
    }
  }

  findTileByKey(key: string) {
    return this.tiles.find(x => x.ids.find(x => x == key));
  }
}
