import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, ViewChild, AfterViewChecked, ElementRef, OnInit } from '@angular/core';
import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { evaluate, parse, parser } from 'mathjs'
import { ClipboardService } from 'ngx-clipboard'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenKeyboardComponent } from './screen-keyboard/screen-keyboard.component';
import { TrigonometricFnArg } from './trigonometric-fn-arg';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked, OnInit {

  result: string;
  mode: string;
  degreeUnit: string = 'deg';
  degreeUnits: string[] = ['deg', 'rad', 'grad'];
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
    window['parse'] = parse;
    window['parser'] = parser;
    window['evaluate'] = evaluate;
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
    let r = this.inp;
    this.isTrigonometric = false;
    let items = this.getTrigonometricFnArgs(r);
    this.isTrigonometric = items.length > 0;
    let orderedItems = this.sortTopological(items);
    for (let i = orderedItems.length - 1; i > -1; i--) {
      console.log('r: ', r);
      let txtOrder = orderedItems[i].txtOrder;
      let arg = r.slice(items[txtOrder].start + 1, items[txtOrder].end);
      let s0 = r.slice(0, items[txtOrder].start + 1);
      let s2 = r.slice(items[txtOrder].end, r.length);
      r = s0 + '(' + arg + ') ' + this.degreeUnit + s2;
      items = this.getTrigonometricFnArgs(r);
    }
    console.log('r: ', r);
    return r;
  }

  private getTrigonometricFnArgs(str: string) {
    let regexp = new RegExp('sin|cos|tan', 'g');
    let match: RegExpExecArray, matches = [];
    while ((match = regexp.exec(str)) != null) {
      matches.push(match.index + 3);
    }

    let items: TrigonometricFnArg[] = [];
    for (let i = 0; i < matches.length; i++) {
      let [s, e] = this.getExprIdxs(str, matches[i]);
      items.push({ start: s, end: e, isMarked: false, txtOrder: i, topologicalOrder: -1 });
    }
    return items;
  }

  convertBrackets(): string {
    let str = this.inp;
    str = str.replace(/{/g, '(');
    str = str.replace(/}/g, ')');
    str = str.replace(/\[/g, '(');
    str = str.replace(/\]/g, ')');
    return str;
  }

  getExprIdxs(str: string, idx: number): number[] {
    let stack = [];
    let r = [0, 0];
    while (str[idx] != '(' && idx < str.length) {
      idx++;
    }
    r[0] = idx;
    stack.push(str[idx]);

    while (stack.length > 0 && idx < str.length) {
      idx++;
      let ch = str[idx];
      if (ch == '(') {
        stack.push(ch);
      } else if (ch == ')') {
        stack.pop();
      }
    }
    r[1] = idx;

    return r;
  }

  private sortTopological(items: TrigonometricFnArg[]): TrigonometricFnArg[] {
    let stack: TrigonometricFnArg[] = [];

    for (let i = 0; i < items.length; i++) {
      let curr = items[i];
      if (!curr.isMarked) {
        this.sortTopologicalUtil(curr, stack, items)
      }
    }
    console.log('topological order: ', stack);
    return stack;
  }

  private sortTopologicalUtil(curr: TrigonometricFnArg, stack: TrigonometricFnArg[], items: TrigonometricFnArg[]) {
    curr.isMarked = true;
    let children = this.getChildrens(items, curr);
    for (let i = 0; i < children.length; i++) {
      if (!children[i].isMarked) {
        this.sortTopologicalUtil(children[i], stack, items);
      }
    }
    stack.push(curr);
  }

  private getChildrens(items: TrigonometricFnArg[], curr: TrigonometricFnArg): TrigonometricFnArg[] {
    let r = [];
    let s = curr.start;
    let e = curr.end;

    for (let i = 0; i < items.length; i++) {
      if (i == curr.txtOrder) {
        continue;
      }
      if (s < items[i].start && e < items[i].end) {
        r.push(items[i]);
      }
    }
    return r;
  }

  onDegreeUnitChange() {
    this.compute();
  }


}
