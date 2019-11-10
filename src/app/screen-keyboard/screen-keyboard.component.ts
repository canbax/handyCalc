import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { iKey } from './iKey';

@Component({
  selector: 'app-screen-keyboard',
  templateUrl: './screen-keyboard.component.html',
  styleUrls: ['./screen-keyboard.component.css']
})
export class ScreenKeyboardComponent implements OnInit {
  @Input() currInp: string;
  @Output() screenKeyClicked = new EventEmitter<string>();
  @ViewChild('mainDiv', { static: false }) myDiv: ElementRef<HTMLElement>;
  private tiles: iKey[];

  constructor() {
    this.tiles = [
      { txt: 'sin', fn: (s) => { return s + 'sin(' } },
      { txt: 'cos', fn: (s) => { return s + 'cos(' } },
      { txt: 'tan', fn: (s) => { return s + 'tan(' } },
      { txt: 'x<sup>2</sup>', fn: (s) => { return s + '^2' } },
      { txt: '&#8730;x', fn: (s) => { return s + '^(0.5)' } },
      { txt: '7', fn: (s) => { return s + '7' } },
      { txt: '8', fn: (s) => { return s + '8' } },
      { txt: '9', fn: (s) => { return s + '9' } },    
      { txt: 'DEL', fn: (s) => { return s.slice(s.length - 1) } },    
      { txt: 'C', fn: (s) => { return '' } },    
      { txt: '4', fn: (s) => { return s + '4' } },    
      { txt: '5', fn: (s) => { return s + '5' } },    
      { txt: '6', fn: (s) => { return s + '6' } },    
      { txt: 'x', fn: (s) => { return s + '*' } },    
      { txt: '÷', fn: (s) => { return s + '÷' } },    
      { txt: '1', fn: (s) => { return s + '1' } },    
      { txt: '2', fn: (s) => { return s + '2' } },    
      { txt: '3', fn: (s) => { return s + '3' } },    
      { txt: '+', fn: (s) => { return s + '+' } },    
      { txt: '-', fn: (s) => { return s + '-' } },    
      { txt: '0', fn: (s) => { return s + '0' } },    
      { txt: '.', fn: (s) => { return s + '.' } },    
      { txt: '(', fn: (s) => { return s + '(' } },    
      { txt: ')', fn: (s) => { return s + ')' } },    
      { txt: '=', fn: (s) => { return s + '=' } }
    ];
  }

  ngOnInit() {
  }

  private tileClicked(k: iKey) {
    this.screenKeyClicked.emit(k.fn(this.currInp));
  }

  simulateKeyDown(key: string) {
    this.myDiv.nativeElement.querySelector('button').click();
  }

  simulateKeyUp(key: string) {
    
  }
}
