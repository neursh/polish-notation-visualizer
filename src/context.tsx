import { create } from 'zustand';

interface AppState {
  numbers: number;
  operators: number;
  keyList: string[];
}

interface AppActions {
  addKey: (key: string) => void;
}

const initialState: AppState = {
  numbers: 0,
  operators: 0,
  keyList: [],
};

const useAppContext = create<AppState & AppActions>()((set) => ({
  ...initialState,
  addKey: (key) => {
    if ('1234567890+-*/'.includes(key)) {
      set((state) => {
        const isOperator = '+-*/'.includes(key);
        return {
          operators: state.operators + (isOperator ? 1 : 0),
          numbers: state.numbers + (isOperator ? 0 : 1),
          keyList: [...state.keyList, key],
        };
      });
    }
    if (key === 'Backspace') {
      set((state) => {
        const isEmpty = state.keyList.length === 0;
        const isOperatorAndValid = '+-*/'.includes(
          state.keyList[state.keyList.length - 1]
        );
        return {
          operators:
            state.operators - (isOperatorAndValid ? (isEmpty ? 0 : 1) : 0),
          numbers:
            state.numbers - (!isOperatorAndValid ? (isEmpty ? 0 : 1) : 0),
          keyList: [...state.keyList.slice(0, -1)],
        };
      });
    }
  },
}));

export default useAppContext;
