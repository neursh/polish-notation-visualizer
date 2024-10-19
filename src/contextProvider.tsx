import { hookstate, none } from '@hookstate/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

export enum NotationType {
  Normal,
  Reversed,
}

export interface IterationResult {
  rawData: (string | number)[];
  calculationStartsAt: number;
  calculationResult: number | string;
  highlight: Map<number, string>;
  calculationAboutToMake: (string | number | undefined)[];
}

export default abstract class AppContext {
  static displayingResult = hookstate(false);
  static notationType = hookstate(NotationType.Normal);
  static result = hookstate<IterationResult[]>([]);
  static calculating = hookstate(false);
  static total = hookstate(0);
  static keyList = hookstate<string[]>([]);

  static operatorSymbolsMapping = {
    '*': '×',
    x: '×',
    ':': '/',
  };

  static allowedKeys = '1234567890.+-*×xX/:% ';

  static numbers = '1234567890';
  static operators = '+-×/%';

  static addKey(key: string) {
    const operatorSymbol =
      AppContext.operatorSymbolsMapping[
        key as keyof typeof AppContext.operatorSymbolsMapping
      ];
    if (operatorSymbol) {
      key = operatorSymbol;
    }

    if (key === 'Backspace' && AppContext.total.get() > 0) {
      AppContext.keyList[AppContext.keyList.length - 1].set(none);
      AppContext.total.set(AppContext.keyList.length);
      return;
    }

    // Duplicates to support pasting.
    if (!AppContext.allowedKeys.includes(key)) return;

    const previousKey = AppContext.keyList[AppContext.keyList.length - 1].get();

    if (key === ' ') {
      if (AppContext.total.get() === 0) {
        return;
      }
      if (previousKey === ' ') {
        return;
      }
    }

    const previousKeyType = {
      isNumber: AppContext.numbers.includes(previousKey),
      isOperator: AppContext.operators.includes(previousKey),
    };
    const currentKeyType = {
      isNumber: AppContext.numbers.includes(key),
      isOperator: AppContext.operators.includes(key),
    };

    if (
      (previousKeyType.isNumber && currentKeyType.isOperator) ||
      (previousKeyType.isOperator && currentKeyType.isOperator) ||
      (previousKeyType.isOperator &&
        previousKey !== '-' &&
        currentKeyType.isNumber)
    ) {
      AppContext.keyList.merge([' ', key]);
    } else {
      AppContext.keyList[AppContext.keyList.length].set(key);
    }

    AppContext.total.set(AppContext.keyList.length);
    return;
  }

  static calculate() {
    if (AppContext.total.get() === 0) return;

    AppContext.calculating.set(true);

    const stackStages: IterationResult[] = [];
    const stack: number[] = [];
    const keyChain = AppContext.keyList.get().join('');
    let tokens = keyChain.split(' ').filter((value) => value !== '');

    if (AppContext.notationType.get() === NotationType.Normal) {
      tokens = tokens.reverse();
    }

    for (let index = 0; index < tokens.length; index++) {
      const value = tokens[index];

      if (AppContext.operators.includes(value)) {
        const [rightHandle, leftHandle] = [stack.pop(), stack.pop()];

        if (
          isNaN(rightHandle as number) ||
          isNaN(leftHandle as number) ||
          !(rightHandle && leftHandle)
        ) {
          stackStages.push({
            rawData: ['undefined'],
            calculationStartsAt: 0,
            calculationResult: 'Error',
            highlight: new Map<number, string>([[0, 'red']]),
            calculationAboutToMake: [
              leftHandle,
              value,
              rightHandle,
              '=',
              'Error',
            ],
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

        let rawData = [
          ...stack,
          leftHandle,
          rightHandle,
          ...tokens.slice(index),
        ];

        if (AppContext.notationType.get() === NotationType.Normal) {
          rawData = rawData.reverse();
        }

        let highlightArray: [number, string][] = [];

        if (AppContext.notationType.get() === NotationType.Normal) {
          highlightArray = [
            [rawData.length - (stack.length + 1), 'green'],
            [rawData.length - (stack.length + 2), 'green'],
            [rawData.length - (stack.length + 3), operationColor],
          ];
        } else {
          highlightArray = [
            [stack.length, 'green'],
            [stack.length + 1, 'green'],
            [stack.length + 2, operationColor],
          ];
        }

        const highlight = new Map<number, string>(highlightArray);

        stackStages.push({
          rawData: rawData,
          calculationStartsAt: stack.length,
          calculationResult: thisResult,
          highlight: highlight,
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
    }

    const final = stack.pop()!;

    stackStages.push({
      rawData: [final],
      calculationStartsAt: 0,
      calculationResult: final,
      highlight: new Map<number, string>([[0, 'green']]),
      calculationAboutToMake: ['Result:', final],
    });

    AppContext.result.set(stackStages);
    AppContext.calculating.set(false);
    AppContext.displayingResult.set(true);
  }

  static resetCalculation() {
    AppContext.result.set([]);
    AppContext.displayingResult.set(false);
  }

  static clear() {
    AppContext.total.set(0);
    AppContext.keyList.set([]);
  }

  static async copy() {
    await writeText(AppContext.keyList.get().join(''));
  }

  static async paste() {
    AppContext.calculating.set(true);

    const text = (await readText()).split('');
    let current = 0;
    const total = text.length;
    const recall = () =>
      setTimeout(() => {
        if (current < total) {
          AppContext.addKey(text[current]);
          current++;
          recall();
        } else {
          AppContext.calculating.set(false);
        }
      }, 25);
    recall();
  }
}
