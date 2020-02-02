import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, ViewChild, AfterViewChecked, ElementRef, OnInit } from '@angular/core';
import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { evaluate } from 'mathjs'
import { ClipboardService } from 'ngx-clipboard'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenKeyboardComponent } from './screen-keyboard/screen-keyboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked, OnInit {

  result: string;
  mode: string;
  degreeUnit: string = 'RAD';
  degreeUnits: string[] = ['RAD', 'DEG', 'GRAD'];
  isTrigonometric: boolean = false;
  modes: string[];
  inp: string = '';
  inpParsed: string = '';
  private modelChanged: Subject<string> = new Subject<string>();
  private keyPressed: Subject<string> = new Subject<string>();
  isOpen: boolean;
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;
  @ViewChild(ScreenKeyboardComponent, { static: false })
  private _screenKeyboard: ScreenKeyboardComponent;
  @ViewChild('userInp', { static: false })
  private _userInp: ElementRef;

  private readonly KEY_UP_DEBOUNCE = 510;
  private readonly INP_CHANGE_DEBOUNCE = 300;

  constructor(private _ngZone: NgZone, private _clipboardService: ClipboardService, private _snackBar: MatSnackBar) {
    this.modes = ['standard', 'extended', 'programmer'];
    this.mode = this.modes[1];
    this.modelChanged.pipe(
      debounceTime(this.INP_CHANGE_DEBOUNCE),
      distinctUntilChanged())
      .subscribe(x => { this.inp = x; this.compute(); });

    // to prevent the glitch when you press continously, debounceTime should be greater than 500ms 
    // some keyup events are NOT catched, for example (^). Subscribe to call keyup for every keydown
    this.keyPressed.subscribe(x => setTimeout(() => { this._screenKeyboard.simulateKeyPress(false, x) }, this.KEY_UP_DEBOUNCE));
    this.isOpen = false;
  }

  ngOnInit() {
    setTimeout(() => this.onModeChange(), 0);
  }

  onModeChange() {
    this._screenKeyboard.setKeyboard(this.mode);
  }

  ngAfterViewChecked(): void {
  }

  private triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  changed(text: string) {
    this.modelChanged.next(text);
  }

  private compute() {
    try {
      let str = this.convertBrackets();
      str = this.convert4AngleUnit();
      this.result = evaluate(str);
      const t = typeof this.result;
      if (t == 'function') {
        this.result = '';
      }
    } catch (e) {
      console.log('e: ', e);
    }
  }

  copy(txt: string) {
    this._clipboardService.copyFromContent(txt);
    this.showSnackbar(`'${txt}' copied!`);
  }

  private showSnackbar(txt: string) {
    this._snackBar.open(txt, 'OK', {
      duration: 2000
    });
  }

  onScreenKeyClicked(txt: string) {
    this.modelChanged.next(txt);
    this._userInp.nativeElement.focus();
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.key == 'Control') {
      return;
    }
    this.keyPressed.next(e.key);
    this._screenKeyboard.simulateKeyPress(true, e.key);
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.key == 'Control') {
      return;
    }
    this._screenKeyboard.simulateKeyPress(false, e.key);
  }

  convert4AngleUnit() {
    const fnList = ['sin', 'cos', 'tan'];
    let r = this.inp;
    this.isTrigonometric = false;
    for (let i = 0; i < fnList.length; i++) {
      let regexp = new RegExp(fnList[i], 'g');
      let match: RegExpExecArray, matches = [];

      while ((match = regexp.exec(r)) != null) {
        matches.push(match.index + fnList[i].length);
      }

      if (matches.length > 0) {
        this.isTrigonometric = true;
      }

      for (let j = 0; j < matches.length; j++) {
        let arr = this.getExprIdxs(matches[j]);
        console.log('first bracket: ', r[arr[0]], ' idx: ', arr[0],  ' sec bracket: ', r[arr[1]], ' idx: ', arr[1], );
        if (arr[1] - arr[0] > 0) {
          let s0 = r.slice(0, arr[0] + 1);
          let s1 = r.slice(arr[0] + 1, arr[1]);
          let s2 = r.slice(arr[1] + 1, r.length);
          r = s0 + 'unit(' + s1 + `,'` + this.degreeUnit.toLowerCase() + `')` + s2;
        }
      }
    }
    return r;
  }

  convertBrackets(): string {
    let str = this.inp;
    str = str.replace(/{/g, '(');
    str = str.replace(/}/g, ')');
    str = str.replace(/\[/g, '(');
    str = str.replace(/\]/g, ')');
    return str;
  }

  getExprIdxs(idx: number): number[] {
    let stack = [];
    let r = [0, 0];
    while (this.inp[idx] != '(' && idx < this.inp.length) {
      idx++;
    }
    r[0] = idx;
    stack.push(this.inp[idx]);

    while (stack.length > 0 && idx < this.inp.length) {
      idx++;
      let ch = this.inp[idx];
      if (ch == '(') {
        stack.push(ch);
      } else if (ch == ')') {
        stack.pop();
      }
    }
    r[1] = idx;

    return r;
  }

  onDegreeUnitChange() {

  }


}
