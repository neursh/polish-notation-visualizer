import AppContext, { IterationResult } from '../contextProvider';

export function reverseCalculate() {
  const stackStages: IterationResult[] = [];
  const stack: number[] = [];
  const infixStack: string[] = [];
  const keyChain = AppContext.keyList.get().join('');
  const tokens = keyChain.split(' ').filter((value) => value !== '');
  for (let index = 0; index < tokens.length; index++) {
    const value = tokens[index];

    if (AppContext.operators.includes(value)) {
      const [rightHandle, leftHandle] = [stack.pop(), stack.pop()];

      // Add to infix notation stack first.
      const [rightInfixHandle, leftInfixHandle] = [
        infixStack.pop(),
        infixStack.pop(),
      ];
      infixStack.push(`(${leftInfixHandle} ${value} ${rightInfixHandle})`);

      if (
        Number.isNaN(rightHandle as number) ||
        Number.isNaN(leftHandle as number) ||
        !(rightHandle && leftHandle)
      ) {
        stackStages.push({
          rawData: ['undefined'],
          calculationStartsAt: 0,
          calculationResult: 'Error',
          highlight: new Map<number, string>([[0, 'red']]),
          hint: [leftHandle, value, rightHandle, '=', 'Error'],
        });

        AppContext.result.set(stackStages);
        AppContext.calculating.set(false);
        return;
      }

      let thisResult = 0;
      let operationColor = '';

      if (value === '+') {
        operationColor = 'blue';
        thisResult = leftHandle + rightHandle;
      }
      if (value === '-') {
        operationColor = 'red';
        thisResult = leftHandle - rightHandle;
      }
      if (value === '×') {
        operationColor = 'orange';
        thisResult = leftHandle * rightHandle;
      }
      if (value === '/') {
        operationColor = '#cc66ff';
        thisResult = leftHandle / rightHandle;
      }
      if (value === '%') {
        operationColor = '#cc66ff';
        thisResult = leftHandle % rightHandle;
      }

      thisResult = Math.round(thisResult * 10000) / 10000;

      let highlightArray: [number, string][] = [];
      highlightArray = [
        [stack.length, 'green'],
        [stack.length + 1, 'green'],
        [stack.length + 2, operationColor],
      ];
      const highlight = new Map<number, string>(highlightArray);

      stackStages.push({
        rawData: [...stack, leftHandle, rightHandle, ...tokens.slice(index)],
        calculationStartsAt: stack.length,
        calculationResult: thisResult,
        highlight: highlight,
        hint: [leftHandle, value, rightHandle, '=', thisResult],
      });

      stack.push(thisResult);
    } else {
      stack.push(Number.parseFloat(value));
      infixStack.push(value);
    }
  }

  const final = stack.pop()!;

  stackStages.push({
    rawData: [final],
    calculationStartsAt: 0,
    calculationResult: final,
    highlight: new Map<number, string>([[0, 'green']]),
    hint: ['Result:', final],
  });

  // Add one more step to display infix notation.
  stackStages.push({
    rawData: [...infixStack, '=', final],
    calculationStartsAt: 0,
    calculationResult: final,
    highlight: new Map<number, string>([[2, 'green']]),
    hint: ['Infix form'],
  });

  AppContext.result.set(stackStages);
  AppContext.calculating.set(false);
  AppContext.displayingResult.set(true);
}
