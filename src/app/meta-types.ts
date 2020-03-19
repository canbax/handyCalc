export interface TrigonometricFnArg {
  start: number;
  end: number;
  txtOrder: number;
  topologicalOrder: number;
  isMarked: boolean;
}

export interface DateTimeChip {
  val: number;
  str: string;
  isOp: boolean;
}