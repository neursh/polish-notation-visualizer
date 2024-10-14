import { hookstate, none } from '@hookstate/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

interface CalculationResult {
  rawData: (string | number)[];
  highlight: Map<number, string>;
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
        let operationColor = '';

        if (value === '+') {
          operationColor = 'blue';
          thisResult = leftHandle + rightHandle;
        }
        if (value === '-') {
          operationColor = 'red';
          thisResult = leftHandle - rightHandle;
        }
        if (value === '*') {
          operationColor = 'orange';
          thisResult = leftHandle * rightHandle;
        }
        if (value === '/') {
          operationColor = '#cc66ff';
          thisResult = leftHandle / rightHandle;
        }

        thisResult = Math.round(thisResult * 10000) / 10000;

        const highlight = new Map<number, string>([
          [stack.length, 'green'],
          [stack.length + 1, 'green'],
          [stack.length + 2, operationColor],
        ]);

        stackStages.push({
          rawData: [...stack, leftHandle, rightHandle, ...tokens.slice(index)],
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
    });

    const final = stack.pop()!;
    const highlight = new Map<number, string>([[0, 'green']]);

    stackStages.push({
      rawData: [final],
      highlight: highlight,
      calculationAboutToMake: [final],
    });

    AppContext.result.set(stackStages);
    AppContext.calculating.set(false);
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
