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
      this.result = evaluate(this.inp);
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
}
