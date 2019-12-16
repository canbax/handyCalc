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
  isOpen: boolean;
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;
  @ViewChild(ScreenKeyboardComponent, { static: false }) 
  private _screenKeyboard: ScreenKeyboardComponent;
  
  constructor(private _ngZone: NgZone, private _clipboardService: ClipboardService, private _snackBar: MatSnackBar) {
    this.modes = ['basic', 'advanced', 'base converter'];
    this.mode = this.modes[0];

    this.modelChanged.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(x => { this.inp = x; this.compute(); });

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
    console.log('onKeyDown: ', e);
    this._screenKeyboard.simulateKeyDown(e.key);
  }

  onKeyUp(e: KeyboardEvent) {
    console.log('onKeyUp: ', e);
  }

}
