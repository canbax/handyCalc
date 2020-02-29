export interface MathFnGroup {
  title: string;
  fnList: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

export const fnGroups: MathFnGroup[] = [{
  title: 'Arithmetic',
  fnList: ['abs(x)', 'add(x, y)', 'cbrt(x [, allRoots])', 'ceil', 'cube', 'divide', 'dotDivide']
}, {
  title: 'Bitwise',
  fnList: ['bitAnd(x, y)', 'bitNot(x)', 'bitOr(x, y)']
}];