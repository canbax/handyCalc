import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { ClipboardModule } from 'ngx-clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { AppComponent } from './app.component';
import { ScreenKeyboardComponent } from './screen-keyboard/screen-keyboard.component';
@NgModule({
  declarations: [
    AppComponent,
    ScreenKeyboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatDividerModule,
    ClipboardModule,
    MatSnackBarModule,
    MatCardModule,
    MatAutocompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
