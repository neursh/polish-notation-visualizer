import { hookstate, none } from '@hookstate/core';

interface CalculationResult {
  rawData: (string | number)[];
  highlightStartsFrom: number;
  calculationAboutToMake: (string | number)[];
}

export default abstract class AppContext {
  static displayingResult = hookstate(false);
  static result = hookstate<CalculationResult[]>([]);
  static calculating = hookstate(false);
  static total = hookstate(0);
  static keyList = hookstate<string[]>([]);

  static addKey(key: string) {
    if ('1234567890.+-*/ '.includes(key)) {
      const keyList = AppContext.keyList.get();
      const [previousKey] = keyList.slice(-1);

      const isPreviousOperator = '+-*/'.includes(previousKey);
      const isPreviousNumber = '1234567890'.includes(previousKey);
      const isOperator = '+-*/'.includes(key);
      const isNumber = '1234567890'.includes(key);

      if (
        (previousKey === key && !isOperator && !isNumber) ||
        (!previousKey && !isNumber) ||
        (key === '.' && !isPreviousNumber)
      ) {
        return;
      }

      if (
        (isPreviousOperator && isNumber) ||
        (isPreviousNumber && isOperator) ||
        (isPreviousOperator && isOperator)
      ) {
        AppContext.total.set((p) => p + 2);
        AppContext.keyList.merge([' ', key]);
        return;
      }

      AppContext.total.set((p) => p + 1);
      AppContext.keyList[AppContext.keyList.length].set(key);
      return;
    }

    if (key === 'Backspace') {
      const isEmpty = AppContext.keyList.length === 0;

      AppContext.total.set((p) => p - (isEmpty ? 0 : 1));
      AppContext.keyList[AppContext.keyList.length - 1].set(none);
      return;
    }
  }

  static calculate() {
    AppContext.calculating.set(true);

    const stackStages: CalculationResult[] = [];
    const stack: number[] = [];
    const keyChain = AppContext.keyList.get().join('');
    const tokens = keyChain.split(' ');

    tokens.forEach((value, index) => {
      if ('+-*/'.includes(value)) {
        const [rightHandle, leftHandle] = [stack.pop()!, stack.pop()!];

        let thisResult = 0;

        if (value === '+') {
          thisResult = leftHandle + rightHandle;
        }
        if (value === '-') {
          thisResult = leftHandle - rightHandle;
        }
        if (value === '*') {
          thisResult = leftHandle * rightHandle;
        }
        if (value === '/') {
          thisResult = leftHandle / rightHandle;
        }

        thisResult = Math.round(thisResult * 10000) / 10000;

        stackStages.push({
          rawData: [...stack, leftHandle, rightHandle, ...tokens.slice(index)],
          highlightStartsFrom: stack.length,
          calculationAboutToMake: [
            leftHandle,
            value,
            rightHandle,
            '=',
            thisResult,
          ],
        });

        stack.push(thisResult);
      } else {
        stack.push(Number.parseFloat(value));
      }
    });

    const final = stack.pop()!;

    stackStages.push({
      rawData: [final],
      highlightStartsFrom: 0,
      calculationAboutToMake: [final],
    });

    AppContext.result.set(stackStages);
    AppContext.calculating.set(false);
  }
}
