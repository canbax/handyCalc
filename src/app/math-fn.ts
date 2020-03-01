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
  fnList: ['abs(x)', 'add(x, y)', 'cbrt(x [, allRoots])', 'ceil(x)', 'cube(x)', 'divide(x, y)', 'dotDivide(x, y)']
}, {
  title: 'Bitwise',
  fnList: ['bitAnd(x, y)', 'bitNot(x)', 'bitOr(x, y)']
}];

export const fnGroupExpo: MathFnGroup[] = [{
  title: 'Arithmetic',
  fnList: ['Calculate the absolute value of a number.', 'Add two or more values, x + y.', 'Calculate the cubic root of a value.',
    'Round a value towards plus infinity If x is complex, both real and imaginary part are rounded towards plus infinity.',
    'Compute the cube of a value, x * x * x.', 'Divide two values, x / y.', 'Divide two matrices element wise.']
}, {
  title: 'Bitwise',
  fnList: ['Bitwise AND two values, x & y.', 'Bitwise NOT value, ~x.', 'Bitwise OR two values, x | y.']
}];