import { Injectable } from '@angular/core';
import { MathOperaor, OPERATOR_TYPE } from './math-types';

@Injectable({
  providedIn: 'root'
})
export class MathEngineService {

  private operators: MathOperaor[];
  private splitterRegex: string;
  private tokenStack: string[];

  constructor() {
    this.operators = [
      { name: 'addition', notations: ['+'], type: OPERATOR_TYPE.binary },
      { name: 'subtraction', notations: ['-'], type: OPERATOR_TYPE.binary },
      { name: 'division', notations: [':', '/'], type: OPERATOR_TYPE.binary },
      { name: 'multiplication', notations: ['x', '.', '*', 'X'], type: OPERATOR_TYPE.binary },
    ];

    this.splitterRegex = '[\ \+\-\:xX\/\*\.]';
  }

  private tokenize(s: string) {
    s = s.toLowerCase();
    let splitters = this.operators
    let arr = s.split(new RegExp(this.splitterRegex, 'g'));
  }

}

