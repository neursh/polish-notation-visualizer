import { create } from 'zustand';

interface AppState {
  total: number;
  keyList: string[];
}

interface AppActions {
  addKey: (key: string) => void;
}

const initialState: AppState = {
  total: 0,
  keyList: [],
};

const useAppContext = create<AppState & AppActions>()((set) => ({
  ...initialState,
  addKey: (key) => {
    if ('1234567890.+-*/ '.includes(key)) {
      const currentState = useAppContext.getState();
      const previousKey = currentState.keyList[currentState.keyList.length - 1];

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
        return set((state) => ({
          total: state.total + 2,
          keyList: [...state.keyList, ' ', key],
        }));
      }

      return set((state) => ({
        total: state.total + 1,
        keyList: [...state.keyList, key],
      }));
    }

    if (key === 'Backspace') {
      set((state) => {
        const isEmpty = state.keyList.length === 0;
        return {
          total: state.total - (isEmpty ? 0 : 1),
          keyList: [...state.keyList.slice(0, -1)],
        };
      });
    }
  },
}));

export default useAppContext;
