import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, ViewChild } from '@angular/core';
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
export class AppComponent {
  result: string;
  mode: string;
  modes: string[];
  inp: string = '';
  private modelChanged: Subject<string> = new Subject<string>();
  private keyPressed: Subject<string> = new Subject<string>();
  isOpen: boolean;
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;
  @ViewChild(ScreenKeyboardComponent, { static: false })
  private _screenKeyboard: ScreenKeyboardComponent;
  private readonly KEY_UP_DEBOUNCE = 510;
  private readonly INP_CHANGE_DEBOUNCE = 300;

  constructor(private _ngZone: NgZone, private _clipboardService: ClipboardService, private _snackBar: MatSnackBar) {
    this.modes = ['basic', 'advanced', 'base converter'];
    this.mode = this.modes[0];

    this.modelChanged.pipe(
      debounceTime(this.INP_CHANGE_DEBOUNCE),
      distinctUntilChanged())
      .subscribe(x => { this.inp = x; this.compute(); });

    // to prevent the glict when you press continously, debounceTime should be greater than 500ms 
    // some keyup events are NOT catched, for example (^). Subscribe to call keyup for every keydown
    this.keyPressed.pipe(debounceTime(this.KEY_UP_DEBOUNCE)).subscribe(x => { this._screenKeyboard.simulateKeyPress(false, x) })
    this.isOpen = false;
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
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.key == 'Control') {
      return;
    }
    console.log('onKeyDown: ', e.key, ' ', new Date().getTime())
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
