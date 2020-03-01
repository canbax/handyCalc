import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, ViewChild, AfterViewChecked, ElementRef, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { evaluate } from 'mathjs'
import { ClipboardService } from 'ngx-clipboard'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenKeyboardComponent } from './screen-keyboard/screen-keyboard.component';
import { TrigonometricFnArg } from './trigonometric-fn-arg';
import { STD_KEYBOARD, EXTENDED_KEYBOARD, PROGRAMMER_KEYBOARD } from './screen-keyboard/keyboards';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MathFnGroup, _filter, fnGroups, fnGroupExpo } from './math-fn';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked, OnInit {

  fnListForm: FormGroup = this._formBuilder.group({
    fnGroup: '',
  });
  fnGroupOptions: Observable<MathFnGroup[]>;

  // results for 4 bases
  results: any[] = ['', '', '', ''];
  mode: string;
  degreeUnit: string = 'deg';
  degreeUnits: string[] = ['deg', 'rad', 'grad'];
  bases: string[] = [];
  base: string = 'DEC';
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
  private hex2dec = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15, 'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
  };
  private keyboardOps: string[] = [];
  private readonly KEY_UP_DEBOUNCE = 510;
  private readonly INP_CHANGE_DEBOUNCE = 300;
  suggestions = [];
  fnExpo = '';
  link2fn = '';
  selectedFloatingPointPrecision = 2;
  numDigit4Results = 6;
  isIgnoreComma = true;
  floatingPointMarker = '.';

  constructor(private _clipboardService: ClipboardService, private _snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
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
    this.keyboardOps = STD_KEYBOARD.filter(x => x.isOp).map(x => x.fn(''));
    this.keyboardOps.push(...EXTENDED_KEYBOARD.filter(x => x.isOp).map(x => x.fn('')));
    this.keyboardOps.push(...PROGRAMMER_KEYBOARD.filter(x => x.isOp).map(x => x.fn('')));
    this.keyboardOps = this.keyboardOps.map(x => x.substring(0, x.length - 1));

    this.suggestions = STD_KEYBOARD.map(x => x.fn(''));
    this.suggestions.push(...EXTENDED_KEYBOARD.map(x => x.fn('')));
    this.suggestions.push(...PROGRAMMER_KEYBOARD.map(x => x.fn('')));

    this.fnGroupOptions = this.fnListForm.get('fnGroup')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterGroup(value))
      );
  }

  fnSelected(e: MatAutocompleteSelectedEvent) {
    let s = e.option.value as string;
    this.link2fn = 'https://mathjs.org/docs/reference/functions/' + s.substr(0, s.indexOf('(')) + '.html'
    s = s.substr(0, s.indexOf('(') + 1);
    this.inp = this.inp + s;
    let group = e.option.group.label;
    let val = e.option.value;

    let idx = fnGroups.find(x => x.title == group).fnList.findIndex(x => x == val);
    this.fnExpo = fnGroupExpo.find(x => x.title == group).fnList[idx];
    setTimeout(() => this.isOpen = false, 0);
    setTimeout(() => this.isOpen = true, 1);
  }

  onModeChange() {
    this._screenKeyboard.setKeyboard(this.mode);
    this.calculateResultsOnOtherBases();
    if (this.mode == 'programmer') {
      this.bases = ['HEX', 'DEC', 'OCT', 'BIN'];
    } else {
      this.bases = [];
    }
  }

  ngAfterViewChecked(): void {
  }

  changed(text: string) {
    this.modelChanged.next(text);
  }

  compute() {
    try {
      let str = this.convertBrackets();
      str = this.convert4AngleUnit();
      if (this.floatingPointMarker == ',') {
        str = str.replace(/,/g, '.');
      } else if (this.isIgnoreComma) {
        str = str.replace(/,/g, '');
      }
      str = this.convertBase2Dec(str);
      this.results[1] = evaluate(str);
      const t = typeof this.results[1];
      if (t == 'function' || t == 'undefined') {
        this.results[1] = '';
      } else if (t == 'number' && !Number.isInteger(this.results[1])) {
        this.results[1] = this.results[1].toFixed(this.selectedFloatingPointPrecision);
      }
      this.results[1] = (this.results[1] + '').substr(0, this.numDigit4Results);;
      this.calculateResultsOnOtherBases();
    } catch (e) {
      this.results = ['', '', '', ''];
      console.log('e: ', e);
    }
  }

  copy(txt: string) {
    this._clipboardService.copyFromContent(txt);
    this.showSnackbar(`'${txt}' copied!`);
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

  private _filterGroup(value: string): MathFnGroup[] {
    if (value) {
      return fnGroups
        .map(group => ({ title: group.title, fnList: _filter(group.fnList, value) }))
        .filter(group => group.fnList.length > 0);
    }
    return fnGroups;
  }

  private calculateResultsOnOtherBases() {
    if (this.mode != 'programmer') {
      return;
    }
    if (this.results[1] == undefined || this.results[1].length < 1) {
      this.results = ['', '', '', ''];
      return;
    }
    let n = Number(this.results[1]);
    this.results[0] = n.toString(16).substr(0, this.numDigit4Results);
    this.results[2] = n.toString(8).substr(0, this.numDigit4Results);
    this.results[3] = n.toString(2).substr(0, this.numDigit4Results);
  }

  private showSnackbar(txt: string) {
    this._snackBar.open(txt, 'OK', {
      duration: 2000
    });
  }

  private convert4AngleUnit() {
    let r = this.inp;
    this.isTrigonometric = false;
    let items = this.getTrigonometricFnArgs(r);
    this.isTrigonometric = items.length > 0;
    let orderedItems = this.sortTopological(items);
    for (let i = orderedItems.length - 1; i > -1; i--) {
      let txtOrder = orderedItems[i].txtOrder;
      let arg = r.slice(items[txtOrder].start + 1, items[txtOrder].end);
      let s0 = r.slice(0, items[txtOrder].start + 1);
      let s2 = r.slice(items[txtOrder].end, r.length);
      r = s0 + '(' + arg + ') ' + this.degreeUnit + s2;
      items = this.getTrigonometricFnArgs(r);
    }
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

  private convertBrackets(): string {
    let str = this.inp;
    str = str.replace(/{/g, '(');
    str = str.replace(/}/g, ')');
    str = str.replace(/\[/g, '(');
    str = str.replace(/\]/g, ')');
    return str;
  }

  private getExprIdxs(str: string, idx: number): number[] {
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

  // math.js works with decimals
  private convertBase2Dec(s: string) {
    if (this.mode != 'programmer') {
      return s;
    }
    let idx = 0;
    let regexp = new RegExp('[0123456789ABCDEFabcdef]+');
    let m: RegExpExecArray;
    while ((m = regexp.exec(s.substring(idx))) != null) {
      if (this.isInOperators(s, m.index + idx)) {
        idx = idx + m[0].length;
        continue;
      }
      let matchIdx = idx + m.index;
      let s1 = s.substr(0, matchIdx);
      let s2 = s.substr(matchIdx + m[0].length, s.length);
      let b = 10;
      if (this.base == 'HEX') {
        b = 16;
      }
      if (this.base == 'OCT') {
        b = 8;
      }
      if (this.base == 'BIN') {
        b = 2;
      }
      let s0 = s.substr(matchIdx, m[0].length);
      let r = this.convert2dec(s0, b);
      idx = s1.length + r.length;
      s = s1 + '' + r + s2;
    }
    return s;
  }

  private convert2dec(s: string, fromBase: number): string {
    if (fromBase == 10) {
      return s;
    }
    let n = 0;
    let pow = 0;
    for (let i = s.length - 1; i > -1; i--) {
      n += this.hex2dec[s[i]] * Math.pow(fromBase, pow);
      pow += 1;
    }
    return n + '';
  }

  private isInOperators(s: string, i: number): boolean {

    let regexp = new RegExp(this.keyboardOps.join('|'), 'gi');
    let match: RegExpExecArray, matches: RegExpExecArray[] = [];
    while ((match = regexp.exec(s)) != null) {
      matches.push(match);
    }

    let isIn = false;
    for (let m of matches) {

      if (i >= m.index && i <= (m.index + m[0].length)) {
        return true;
      }
    }
    return isIn;
  }



}
