export interface CalcBtn {
  txt: string;
  ids: string[];
  fn: (s: string) => string,
  isPressed?: boolean;
}