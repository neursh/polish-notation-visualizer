import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo } from 'react';
import useAppContext from './context';

export default function App() {
  const addKey = useAppContext((state) => state.addKey);

  const keyboardEvent = useCallback((e: KeyboardEvent) => addKey(e.key), []);

  const keyboardEventRegister = useCallback(() => {
    window.addEventListener('keydown', keyboardEvent);
  }, []);

  const keyboardEventRemover = useCallback(() => {
    window.removeEventListener('keydown', keyboardEvent);
  }, []);

  useEffect(() => {
    keyboardEventRegister();

    return keyboardEventRemover;
  }, [keyboardEventRegister]);

  return (
    <div className="flex flex-col w-full h-screen items-center justify-center">
      <div className="w-1/2 h-40 overflow-y-scroll pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
        <CharactersContainer />
      </div>
      <div className="flex w-1/2 justify-between">
        <Counter />
      </div>
    </div>
  );
}

function Counter() {
  const numbers = useAppContext((state) => state.numbers);
  const operators = useAppContext((state) => state.operators);
  const pivot = useMemo(() => numbers - operators, [numbers, operators]);
  const areBothZero = useMemo(
    () => numbers === 0 && operators === 0,
    [numbers, operators]
  );

  return (
    <div
      className={`flex gap-2 mt-2 pr-2 pl-2 rounded-lg outline outline-1 ${
        pivot === 1
          ? 'outline-green-500'
          : areBothZero
          ? 'outline-gray-400'
          : 'outline-red-500'
      }`}
    >
      <p>
        <span className="font-bold">{numbers}</span> numbers
      </p>
      <p>
        <span className="font-bold">{operators}</span> operators
      </p>
      <div
        className={`h-full w-[1px] ${
          pivot === 1
            ? 'bg-green-500'
            : areBothZero
            ? 'bg-gray-400'
            : 'bg-red-500'
        }`}
      />
      <p>
        {pivot > 1
          ? 'Too many numbers'
          : pivot < 1
          ? areBothZero
            ? 'Waiting for input...'
            : 'Too many operators'
          : 'Valid'}
      </p>
    </div>
  );
}

function CharactersContainer() {
  const keyList = useAppContext((state) => state.keyList);

  return (
    <div className="flex flex-wrap gap-6 font-semibold select-none">
      {keyList.map((value, index) => (
        <Character value={value} key={`key-${index}`} />
      ))}
    </div>
  );
}

function Character(props: { value: string }) {
  return (
    <p className="rounded-sm text-center text-3xl">
      <motion.span
        className="inline-block"
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.25, 0, 1] }}
      >
        {props.value}
      </motion.span>
    </p>
  );
}
