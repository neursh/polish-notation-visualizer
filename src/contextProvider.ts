import { hookstate, none } from '@hookstate/core';
import { normalCalculate } from './services/polishNormal';
import { reverseCalculate } from './services/polishReverse';

export enum NotationType {
  Normal,
  Reversed,
}

export interface IterationResult {
  rawData: (string | number)[];
  calculationStartsAt: number;
  calculationResult: number | string;
  highlight: Map<number, string>;
  hint: (string | number | undefined)[];
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
    X: '×',
    ':': '/',
  };

  static allowedKeys = '1234567890.+-*×xX/:% ';

  static numbers = '1234567890';
  static operators = '+-×/%';
  // check input if it's in mappings
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
    // check if key is a number or an opertor symbol
    const previousKeyType = {
      isNumber: AppContext.numbers.includes(previousKey),
      isOperator: AppContext.operators.includes(previousKey),
    };
    const currentKeyType = {
      isNumber: AppContext.numbers.includes(key),
      isOperator: AppContext.operators.includes(key),
    };
    //auto spacing :D
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
  //calculating reverse/normal polish notation
  static calculate() {
    if (AppContext.total.get() === 0) return;
    AppContext.calculating.set(true);

    if (AppContext.notationType.get() == NotationType.Reversed) {
      reverseCalculate();
    } else {
      normalCalculate();
    }
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
    await navigator.clipboard.writeText(AppContext.keyList.get().join(''));
  }

  static async paste() {
    AppContext.calculating.set(true);

    const text = await navigator.clipboard.readText();
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
