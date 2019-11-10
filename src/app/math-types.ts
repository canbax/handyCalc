export interface MathOperaor {
  name: string;
  notations: string[];
  type: OPERATOR_TYPE;

}

export enum OPERATOR_TYPE {
  unary = 0, binary = 1, ternary = 2
}

