import { hookstate, none } from '@hookstate/core';

export default abstract class AppContext {
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
}
